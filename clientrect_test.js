var p = document.querySelector("#child");
console.log(p);

var rects = p.getClientRects();
for (var i = 0; i < rects.length; i++) {
    var r = rects[i];
    drawOverlayRectangle(r.left, r.top, r.width, r.height);
}
console.log("rectangles:");
console.log(rects);




function drawOverlayRectangle(x, y, w, h) {
	var div = document.createElement("div");
	div.className = "rectangle"
	div.style.border = "0.5px solid mediumblue"
	div.style.position = "absolute";
	div.style.left = x;
	div.style.top = y;
	div.style.width = w;
	div.style.height = h;
	document.querySelector("body").appendChild(div);
	return div;
}