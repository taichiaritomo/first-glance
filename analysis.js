/* Text editor canvas size */
var editorSize = 512; // assumes text bitmap is square
var mapSize = 128; // size of saliency map
var downsample = editorSize / mapSize;

var CONVOLUTION_FILTERS = {
    AVG_3: [ [0.1111, 0.1111, 0.1111], [0.1111, 0.1111, 0.1111], [0.1111, 0.1111, 0.1111] ],
    AVG_5: [ [0.04, 0.04, 0.04, 0.04, 0.04], [0.04, 0.04, 0.04, 0.04, 0.04], [0.04, 0.04, 0.04, 0.04, 0.04], [0.04, 0.04, 0.04, 0.04, 0.04], [0.04, 0.04, 0.04, 0.04, 0.04] ],
    AVG_7: [ [0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816], [0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816], [0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816], [0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816], [0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816], [0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816], [0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816, 0.02040816] ]
};

/* Hue of orange used for heatmap */
//var HOT_ORANGE = { R: 255, G: 125, B: 0 };

// track session to know if saliency data is up to date
var session = 0;


/* Test saliency mapping algorithm with a standard image */
function test_process() {
	// test with nice-hair image
	Jimp.read("test-img.png", function(err, image) {
		/* testing independent resize */
//		var resized = resizeBilinearRGBA(image.bitmap.data, 256, 256, 128, 128);
//		test_renderRGBA(resized, 128, 128);
//		
//		image.resize(128,128);
//		test_renderRGBA(image.bitmap.data, 128, 128);
//		
//		var rs = new Jimp(128, 128);
//		rs.bitmap.data = resized;
//		
//		var diff = Jimp.diff(rs, image);
//		console.log("image difference percent: " + diff.percent);
		
		/* Basically, the bootleg resizing isn't the same. and that's why it leads to these weird results" */	
		
		// saliency mapping ...
		var gray = grayscale(image.bitmap.data, 256, 256);
		test_renderGS(gray, 256, 256);
		
		test_saliency(gray, 256, 256);	
	});
}


/* Rasterizes editor contents
 * @returns the saliency map (128x128), represented as an array of grayscale (0-1) values
 */
function look() {
	console.log("looking...");
	
	var ql = document.querySelector("#editor");
	
	var textImage = new Jimp(editorSize, editorSize);
	
    /* Retrieve current content from Quill editor for caching */
    var currentText = editor.getContents();
    
    /* Rasterize text editor content */
    html2canvas(ql, { bgcolor: "white", scale: 1 })
    .then(function (canvas) {
        var data = canvas.getContext("2d").getImageData(0,0,canvas.width, canvas.height).data;
        textImage.bitmap.data = data;
        var textImageCopy = data.slice();
        var heatmap = null;
        
        if (heat_view) {
            textImage.resize(mapSize, mapSize); // downsample in Jimp
            var gs = grayscale(textImage.bitmap.data, mapSize, mapSize); // convert to grayscale
            var saliencyMap = computeSaliency(gs, mapSize, mapSize); // compute saliency map
            heatmap = heat(saliencyMap); // render saliency map to hotplate
        }
        
        V_CTRL.updateCurrent(currentText, textImageCopy, heatmap);
        
        /* test function calls */
        // test_renderRGBA(image.bitmap.data, editorSize, editorSize); // render (testing)
        // test_renderRGBA(image.bitmap.data, mapSize, mapSize); // render (testing)
        // test_saliency(gs, mapSize, mapSize);
    
        /* Hotplate/Glance view handler */
		// if (glance_view) { blur(s_map); }
        // else if (heat_view) { heat(s_map); }
    });
}


function heat(s_map) {
	var map = new Jimp(mapSize, mapSize),
		l = mapSize*mapSize;
	
	// fill map bitmap data with colors from array
	for (var i = 0; i<l; i++) {
		var i4 = i*4,
			p = s_map[i],
			adjusted_intensity = 255 * (p > 1 ? 1 : (p < 0 ? 0 : p));
		map.bitmap.data[i4]   = adjusted_intensity;
		map.bitmap.data[i4+1] = adjusted_intensity;
		map.bitmap.data[i4+2] = adjusted_intensity;
		map.bitmap.data[i4+3] = 255;
	}
	
	map.resize(editorSize, editorSize);
	map.blur(8);
    var pixels = map.bitmap.data;
	
	var canvas = document.querySelector("#heatmap"),
		context = canvas.getContext("2d"),
		imgData = context.createImageData(editorSize, editorSize);
	// fill imgData with pixel data
	for (var i = 0; i < imgData.data.length; i+=4) {
		imgData.data[i]   = 255;
		imgData.data[i+1] = 255 - 130*(3*pixels[i+1]/255);
		imgData.data[i+2] = 255 - 3*pixels[i+2];
		imgData.data[i+3] = 255;
	}
	context.putImageData(imgData, 0, 0);
	
	document.querySelector("#heatmap").style.opacity = 1;
    
    return imgData; // return full-size heatmap data
}




/* SalientNode object maps character index in editor to saliency of the text node
 * containing that character */
function SalientNode(charIndex, saliency, area) {
	this.charIndex = charIndex;
	this.saliency = saliency;
	this.area = area;
}

/* Applies saliency map contents to text editor nodes
 * @param s_map a 128x128 saliency map, given as an array of grayscale (0-1) values
 */
function blur(s_map) {
	
	// set up text shadow
	var ancestor = document.querySelector(".ql-editor"),
		descendents = ancestor.getElementsByTagName("*");
	for (var i = 0; i < descendents.length; ++i) {
		var e = descendents[i];
		var color = e.style.color;
		e.style.textShadow = "0 0 0 " + color;
	}
	
	
	session++; // update session counter for saliency refresh
	console.log();
	console.log("session: " + session);
	
	salientNodes = [];
	
	// for each text node
	var qLines     = editor.getLines(0), // via Quill
        c          = 0; // character index in editor
	
	console.log(editor.getLines(0));
//	console.log(editor.getLine(0));
//	console.log(editor.getLeaf(0));
//	console.log(editor.getContents(0));
	
//	console.log(qLines);
	
	// Sample saliency for each line/op in editor
	for (var i = 0; i < qLines.length; i++) {
		var qLineContents = qLines[i].cache.delta;
		if (!qLineContents) {
			console.log(qLines[i].cache);
			console.log("No delta");
			continue;
		}
		console.log(qLines[i]);
		
		// each operation in the Delta for the qLine corresponds to a text node
		for (var j = 0; j < qLineContents.ops.length; j++) {
			var op = qLineContents.ops[j];
			
			if (!op.insert) { continue; } // skip non-"insert" operations
			
			op.saliency = 0; // store saliency as an op property
			op.area = 0;
			
			var k = 0,            // character index within the op
				lastY = -1,       // record yposition for detecting text wrapping
				lineLengths = [], // an array of character counts for each line
				lineCount = -1,   // a running counter for which line we're on
				anchor = -1;       // non-whitespace character in node
			
			// Find anchor and count text-wrapped new lines.
			for (k = 0; k < op.insert.length; k++) {
				if (anchor == -1 && !(/\s/.test(editor.getText(c+k, 1)))) {
					console.log(editor.getText(c+k, 1));
					anchor = c+k;
				}
				var charBounds = editor.getBounds(c+k, 1); // get dimensions of character 
				if (charBounds.top > lastY) { // new line found
					lastY = charBounds.top; // record new line y position
					lineLengths.push(1);
					lineCount++;
                // ISOLATE FOR TESTING op.saliency += sampleMap(s_map, Math.floor(x/4), Math.floor(y/4), Math.floor(w/4), Math.floor(h/4));
				} else {
					lineLengths[lineCount] += 1;
				}
			}
			
			// Sample each line
			for (lineCount = 0, k = 0; lineCount < lineLengths.length; lineCount++) {
				var ll = lineLengths[lineCount],
					lineBounds = editor.getBounds(c+k, ll),
					x = lineBounds.left - 1,
					y = lineBounds.top - 1,
					w = lineBounds.width,
					h = lineBounds.height,
					d = downsample,
					s = 0,
					a = w * h;
				
				if (a > 0) {
					s = sampleMap(s_map, x/d, y/d, w/d, h/d);
					
					// draw saliency indicators
					// var div = drawOverlayRectangle(x+1, y+1, w, h);
					// if (s) div.textContent = s.toFixed(5);

					// average-in saliency of line by factoring relative area
					op.anchor = anchor;
					op.saliency = (op.area*op.saliency + a*s)/(op.area + a);
					op.area += a;
				}
				
				k += ll; // move forward character count by line length
			}
			
			// record salient nodes with character, saliency, and area info
			if (op.saliency > 0) {
				salientNodes.push(new SalientNode(anchor, op.saliency, op.area));
			}
			
			c += op.insert.length; // move forward character index
		}
		
		// console.log(qLineContents);
	}
	// console.log(salientNodes);
	
	
    
//    console.log("Salient Nodes: ");
//    console.log(salientNodes);
//    for (var i = 0; i < salientNodes.length; i++) {
//        var n = salientNodes[i];
//        
//        var blot = editor.getLeaf(n.charIndex+1)[0],
//            node = blot.domNode.parentNode,
//            normalized = 0,
//            blurRadius = 0;
//        
//        if (node.getAttribute("data-session") != session) {
//            node.setAttribute("data-session", session);
//            node.setAttribute("data-saliency", n.saliency);
//            node.setAttribute("data-area", n.area);
//        } else {
//            console.log("yar");
//            var s = node.getAttribute("data-saliency") * 1,
//                a = node.getAttribute("data-area") * 1; // multiply by 1 to convert to number
//            var avg = ((a*s + n.area*n.saliency)/(a+n.area));
//            node.setAttribute("data-saliency", averaged);
//			node.setAttribute("data-area", a+n.area);
//        }
//    }
    
    
    
    
	
	// Normalize aggregated saliency values on a 10-point scale and apply text rendering effects	
	var minSaliency = Infinity,
		maxSaliency = -Infinity;
	for (var i = 0; i < salientNodes.length; i++) {
		var s = salientNodes[i];
		if (!s.saliency) {
			s.saliency = 0;
		} else {
			minSaliency = Math.min(s.saliency, minSaliency);
			maxSaliency = Math.max(s.saliency, maxSaliency);
		}
	}
	
	minSaliency = 0; // testing if minSaliency should just be 0.
	var range = maxSaliency - minSaliency;
	
	for (var i = 0; i < salientNodes.length; i++) {
		var n = salientNodes[i];
		
		// console.log(salientNodes[i]);
		// console.log(editor.getLeaf(n.charIndex+1));
		
		var blot = editor.getLeaf(n.charIndex+1)[0],
			node = blot.domNode.parentNode,
			normalized = 0,
			blurRadius = 0;
		
		// console.log(editor.getText(n.charIndex+1, 1));
		// console.log(editor.getLeaf(n.charIndex+1));
		
		if (node.getAttribute("data-session") != session) {
			node.setAttribute("data-session", session);
			node.setAttribute("data-saliency", n.saliency);
			node.setAttribute("data-area", n.area);
			normalized = Math.ceil(8*(n.saliency - minSaliency)/range);
			blurRadius = (8 - normalized)/2;
		} else {
            console.log("yar");
			var s = node.getAttribute("data-saliency") * 1,
				a = node.getAttribute("data-area") * 1; // multiply by 1 to convert to number
			var averaged = ((a*s + n.area*n.saliency)/(a+n.area));
			node.setAttribute("data-saliency", averaged);
			node.setAttribute("data-area", a+n.area);
			normalized = Math.ceil(8*(averaged - minSaliency)/range);
			blurRadius = (8 - normalized)/2;
		}
		
		console.log(node);
		console.log("saliency level: " + normalized);
		node.style.webkitTextFillColor = "transparent";
		var color = node.style.color;
		node.style.textShadow = "0 0 " + blurRadius + "px " + color;
	}
	
}


function unblur() {
	var ancestor = document.querySelector(".ql-editor"),
		descendents = ancestor.getElementsByTagName("*");
	var i, e, d;
	for (i = 0; i < descendents.length; ++i) {
		e = descendents[i];
		var color = e.style.color;
		e.style.textShadow = "0 0 0 " + color;
	}
}

