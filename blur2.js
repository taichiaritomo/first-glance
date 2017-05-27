/* Segment object represents a continuous string of
   text with the same attributes, uninterrupted by
   new lines. */
function Segment(charIndex, charLength, saliency, area) {
	this.charIndex = charIndex;   // starting character index
    this.charLength = charLength; // character length
	this.saliency = saliency;     // measured visual saliency
	this.area = area;             // pixel area
}


function blurFAILED(s_map) {
    
	// set up default text shadow for blur animation
	var ancestor = document.querySelector(".ql-editor"),
		descendents = ancestor.getElementsByTagName("*");
	for (var i = 0; i < descendents.length; ++i) {
		var e = descendents[i];
		var color = e.style.color;
		e.style.textShadow = "0 0 0 " + color;
    }
    
    
    /* Text Segments correspond to text nodes in the DOM
       They are either separated by a newline character
       or different text styles. */ 
	segments = [];
    
    
    /* A Delta (https://quilljs.com/docs/delta/) object
       containing ops (operations) of text with different
       attributes. */
    var editorContents = editor.getContents(),
        c = 0; // character index
    console.log(editorContents);
    
    
    /* Scan the editor by op */
	for (var op_i = 0; op_i < editorContents.length; op_i++) { // increment character index
        var op = editorContents[op_i];
        
        /* We further separate each op into segments
           at newline characters */
        
        /* Current Segment with default anchor at -1.
           A segment's anchor is its first non-whitespace
           character's position*/
        var currentSegment = new Segment(-1, 0, 0, 0);
        
        for (var op_c = 0; op_c < op.insert.length; op_c++) {
            
            // find an anchor for new segment
            if (currentSegment.charIndex == -1 && !(/\s/.test(editor.getText(c + op_c, 1)))) {
                console.log("anchor: " + editor.getText(c + op_c, 1));
                currentSegment.charIndex = c + op_c;
            }
            
            // check for segment separation
            if (currentSegment.charIndex != -1) {
                
                // if current character is newline, finish segment and reset
                if (/\n/.test(editor.getText(c + op_c, 1))) {
                    segments.push(currentSegment);
                } else {
                    
                }
            }
            
            
            
            
            
            /* We measure each segment's area as a sum of
               its text-wrapped lines */
            
            
        }
	}
	
}

function blur2(s_map) {
    var lines = editor.getLines();
    console.log(lines);
}