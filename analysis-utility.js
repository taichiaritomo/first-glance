// Returns the bounds of a text range
// by adding up the area of each character
function getArea(index, length) {
	var end = index + length;
	var area = 0
	for (var i = index; i < end; i++) {
		var bnds = editor.getBounds(i, 1);
		area = area + (bnds.width * bnds.height);
	}
	return area;
}







/* doesn't seem to work: Resize RGBA image array */
function resizeBilinearRGBA(srcImg, srcW, srcH, dstW, dstH) {
	
	var dstImg = [];
	
	var interpolate = function(k, kMin, vMin, kMax, vMax) {
		// special case - k is integer
		if (kMin === kMax) {
			return vMin;
		}

		return Math.round((k - kMin) * vMax + (kMax - k) * vMin);
	};
	
	var assign = function(pos, offset, x, xMin, xMax, y, yMin, yMax) {
		var posMin = (yMin * srcW + xMin) * 4 + offset;
		var posMax = (yMin * srcW + xMax) * 4 + offset;
		var vMin = interpolate(x, xMin, srcImg[posMin], xMax, srcImg[posMax]);

		// special case, y is integer
		if (yMax === yMin) {
			dstImg[pos+offset] = vMin;
		} else {
			posMin = (yMax * srcW + xMin) * 4 + offset;
			posMax = (yMax * srcW + xMax) * 4 + offset;
			var vMax = interpolate(x, xMin, srcImg[posMin], xMax, srcImg[posMax]);

			dstImg[pos+offset] = interpolate(y, yMin, vMin, yMax, vMax);
		}
	}

	for (var i = 0; i < dstH; i++) {
		for (var j = 0; j < dstW; j++) {
			var posDst = (i * dstW + j) * 4;

			// x & y in src coordinates
			var x = j * srcW / dstW;
			var xMin = Math.floor(x);
			var xMax = Math.min(Math.ceil(x), srcW-1);

			var y = i * srcH / dstH;
			var yMin = Math.floor(y);
			var yMax = Math.min(Math.ceil(y), srcH-1);

			assign(posDst, 0, x, xMin, xMax, y, yMin, yMax);
			assign(posDst, 1, x, xMin, xMax, y, yMin, yMax);
			assign(posDst, 2, x, xMin, xMax, y, yMin, yMax);
			assign(posDst, 3, x, xMin, xMax, y, yMin, yMax);
		}
	}
	
	return dstImg;
	
}




/* Render RGBA (0-255) image array data in test canvas */
function test_renderRGBA(imageArray, width, height) {
	var pixels = imageArray,
		
		arrayLength = width * height,

		// Create canvas
		canvas = document.createElement("canvas"),
		context = canvas.getContext("2d"),
		imgData = context.createImageData(width, height);

	canvas.width = width;
	canvas.height = height;

	// fill imgData with colors from array
	for(var i = 0; i < imgData.data.length; i+=4) {
		imgData.data[i]   = pixels[i];
		imgData.data[i+1] = pixels[i+1];
		imgData.data[i+2] = pixels[i+2];
		imgData.data[i+3] = pixels[i+3];
	}

	// put data to context at (0, 0)
	context.putImageData(imgData, 0, 0);

	// output image
	var img = new Image();
	img.src = canvas.toDataURL('image/png');

	// add image to body (or whatever you want to do)
	document.body.querySelector("#test-display").appendChild(img);
}

/* Render grayscale (0-1) image array data in test canvas */
function test_renderGS(imageArray, width, height) {
	var pixels = imageArray,
		l = width * height,
		
		// Create canvas
		canvas = document.createElement("canvas"),
		context = canvas.getContext("2d"),
		imgData = context.createImageData(width, height);

	canvas.width = width;
	canvas.height = height;

	// fill imgData with colors from array
	for(var i = 0; i<l; i++) {
		var i4 = i*4,
			p = pixels[i],
			adjusted_intensity = 255 * (p > 1 ? 1 : (p < 0 ? 0 : p));
		imgData.data[i4]   = adjusted_intensity;
		imgData.data[i4+1] = adjusted_intensity;
		imgData.data[i4+2] = adjusted_intensity;
		imgData.data[i4+3] = 255;
	}

	// put data to context at (0, 0)
	context.putImageData(imgData, 0, 0);

	// output image
	var img = new Image();
	img.src = canvas.toDataURL('image/png');

	// add image to body (or whatever you want to do)
	document.body.appendChild(img);
}





/* Count number of entries in imageArray that are < 255 */
function test_countSub255(imageArray, width, height) {
	var l = width * height,
		a = imageArray,
		c = 0;

	for (var i = 0; i < l; i++) {
		if (a[i] < 255) {
			c = c + 1;
		}
	}

	return c;
}

/* Save input image to computer for testing */
function test_saveImage(dataUrl) {
	var link = document.createElement('a');
	link.download = 'my-image-name.png';
	link.href = dataUrl;
	link.click();
}









/* Naive calculation of attention distribution using
   text surface area and formatting weights.
   Visual feedback: blurring */
function naiveAttn() {

	// Calculate attention values for all contents
	var lines = editor.getLines();
	console.log(lines);
	var l = lines.length,
		index = 0,     // character index in content //
		totalAttn = 0; // enumerate attention values

	for (var i = 0; i < l; i++) {

		var line = lines[i],
			lineContents = line.cache.delta; // Get delta of the line
        // var lineLength = line.cache.length;
		
		// Operate on every operation in the Delta
		for (var j = 0; j < lineContents.ops.length; j++) {
			
			var op = lineContents.ops[j];
			
			if (op.insert) {
				var op_l = op.insert.length,
					area = getArea(index, op_l),
					coef = s_pt + (op.attributes ? ((op.attributes.bold ? s_b : 0) + (op.attributes.italic ? s_i : 0)) : 0);
				
				var myBounds = editor.getBounds(index, op_l);
				console.log(editor.getBounds(index, op_l));
				var div = document.createElement("div");
				div.style.backgroundColor = "rgba(225,222,125,0.5)";
				div.style.position = "absolute";
				div.style.top = myBounds.top;
				div.style.left = myBounds.left;
				div.style.height = myBounds.height;
				div.style.width = myBounds.width;
				document.querySelector("#overlay").appendChild(div);
				
				op.coef = coef;
				op.attn = coef * area;
				
				totalAttn = totalAttn + op.attn;
				
				console.log("index: " + index + "\n" + "text: " + op.insert.trim() + "\n" + "area: " + area);
				console.log("");
				
				index = index + op_l; // increment index
			}
			
		}
		
	}


	// Print % attn demanded by each nontrivial (non-\n) text node
	// Apply visual feedback according to weights
	for (var i = 0; i < l; i++) {
		var line = lines[i],
			lineContents = line.cache.delta,
			lineCoef = 0; // attn weight of the line
		
		// return % attn demanded by each line
		for (var j = 0; j < lineContents.ops.length; j++) {
			var op = lineContents.ops[j];
			if (op.insert && op.insert.trim().length > 0) {
				lineCoef = Math.max(lineCoef, op.coef); // Consider max-weight for whole line
				console.log(op.insert + "\n" + (op.attn / totalAttn).toFixed(2) * 100 + "% attn");
				console.log("");
			}
		}

//		var color = line.domNode.style.color;
		line.domNode.style.webkitTextFillColor = "transparent"; // No IE support
		var blurRadius = 4 - 2 * lineCoef;
		line.domNode.style.textShadow = "0 0 " + blurRadius + "px black";
	}

}


/* DEFUNCT: Resize image blob (produced by domtoimage) */
function resize(blob) {
	console.log(blob);
	
	var reader = new FileReader();
	reader.addEventListener("loadend", function() {
		
		var result = reader.result;
		console.log(result);
		
		Jimp.read(result).then(function (image) {
			console.log(image);
			
			image.resize(128,128)
				 .getBase64(Jimp.MIME_PNG, function (err, src) {
					var img = new Image();
					img.src = src;
					document.body.appendChild(img);
				 });
			
			console.log(test_countSub255(image.bitmap.data, image.bitmap.width, image.bitmap.height));
			
		}).catch(function (error) {
			console.error("error");
		});
	});
	
	reader.readAsArrayBuffer(blob);
}


/* DEFUNCT: Testing Fast Fourier Transform wrapper method
   Input canvas context, tests stuff */
function test_fftRGBA() {
	var spectrum = document.querySelector('#Spectrum').getContext('2d');
    var result = document.querySelector('#Result').getContext('2d');
    spectrum.fillStyle = '#ffffff';
    spectrum.fillRect(0, 0, spectrum.canvas.width, spectrum.canvas.height);
    result.fillStyle = '#ffffff';
    result.fillRect(0, 0, result.canvas.width, result.canvas.height);

    var image = new Image();
    image.src = 'test-img_sml.png';
    image.addEventListener('load', function(e) {
        var w = image.width,
            h = image.height,
            re = [],
            im = [];
        try {
            FFT.init(w);
            FrequencyFilter.init(w);
            SpectrumViewer.init(spectrum);

        }//apply($('input[name=filter]:checked').val());
        catch (e) {
            alert(e);
        }
		
		try {
			spectrum.drawImage(image, 0, 0);
			var src = spectrum.getImageData(0, 0, w, h),
				data = src.data,
				radius = 30,
				i = 0,
				val = 0,
				p = 0;

			// original method of collecting rgba data.
//			for (var y = 0; y < h; y++) {
//				i = y * w;
//				for (var x = 0; x < w; x++) {
//					re[i + x] = data[(i << 2) + (x << 2)]; // take only red values
//					im[i + x] = 0.0;
//				}
//			}
			
			for (var px = 0; px < 4*w*h; px+=4) {
				re.push(data[px]); // take only red value for grayscale intensity
				im.push(0.0);
			}
			
			FFT.fft2d(re, im);
			
			// swap quadrant
			FrequencyFilter.swap(re, im);
//			FrequencyFilter.HPF(re, im, radius);
			SpectrumViewer.render(re, im, true);
			
			// swap quandrant
			FrequencyFilter.swap(re, im);

			FFT.ifft2d(re, im);
			for (var y = 0; y < h; y++) {
				i = y * w;
				for (var x = 0; x < w; x++) {
					val = re[i + x];
					val = val > 255 ? 255 : val < 0 ? 0 : val;
					p = (i << 2) + (x << 2);
					data[p] = data[p + 1] = data[p + 2] = val;
				}
			}
			result.putImageData(src, 0, 0);
		} catch (e) {
			alert(e);
		}

		function checkTypedArray() {
			try {
				var u8 = new Uint8Array(1),
					f64 = new Float64Array(1);
			} catch (e) {
				console.log(e);
			}
		}
    }, false);
}


function drawOverlayRectangle(x, y, w, h) {
	var div = document.createElement("div");
	div.className = "saliency-indicator"
	div.style.border = "0.5px solid mediumblue"
//	div.style.backgroundColor = "rgba(225,222,125,0.2)";
	div.style.position = "absolute";
	div.style.left = x;
	div.style.top = y;
	div.style.width = w;
	div.style.height = h;
	document.querySelector("#rectangles").appendChild(div);
	return div;
}