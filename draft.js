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

		line.domNode.style.color = "rgba(0,0,0,0)";
		var blurRadius = 4 - 2 * lineCoef;
		line.domNode.style.textShadow = "0 0 " + blurRadius + "px black";
	}

}