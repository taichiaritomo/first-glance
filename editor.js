/* Initialize Quill Editor */
var editor = new Quill("#editor", {
	modules: {
		toolbar: "#toolbar"
	},
	theme: "snow"
});


/* Testing shorter content */
editor.setContents([
	{
		insert: ""
	},
	{
		insert: "This is ",
		attributes: { color: "#999999", italic: true, size: "large" }
	},
	{
		insert: "Lookas",
		attributes: { color: "#999999", bold: true, italic: true, size: "large" }
	},
	{
		insert: "\na ",
		attributes: { color: "#999999", bold: false, italic: true }
	},
	{
		insert: "text-editing tool",
		attributes: { color: "#999999", bold: true, italic: true }
	},
	{
		insert: " that measures ",
		attributes: { color: "#999999", italic: true }
	},
	{
		insert: "visual saliency",
		attributes: { color: "#999999", bold: true, italic: true }
	},
	{
		insert: "\nto guide constructive thinking about information design.\n\nWhen we create written information, we can manipulate space, form, size, and color...which can be a lot to keep track of.\n\nSo Lookas shows you what stands out at first glance.",
		attributes: { color: "#999999", italic: true }
	}
]);


user_edited = false; // did user edit content yet?

window.onload = function() {
	document.querySelector(".ql-editor").focus();
	editor.format("color", "black");
	editor.format("italic", false);
	document.querySelector(".heat").click();
};

/* Function called when test button is pressed */
function glanceButtonHandler() {
	// turn off heat view, if on
	if (heat_view) {
		document.querySelector(".heat").style.color = "black";
		document.querySelector("#heatmap").style.opacity = 0;
		heat_view = false;
	}
	
	// switch glance_view
	glance_view = !glance_view;
	if (glance_view) {
		document.querySelector(".eye").innerHTML = "&#9673;";
		look();
	} else {
		document.querySelector(".eye").innerHTML = "&#9678;";
		unblur();
	}
	
//	naiveAttn();
//	test_process();
//	var s_map = look();
}


function heatButtonHandler() {
	// turn off glance view, if on
	if (glance_view) {
		document.querySelector(".eye").innerHTML = "&#9678;";
		unblur();
		glance_view = false;
	}
	
	// switch heat view
	heat_view = !heat_view;
	if (heat_view) {
		document.querySelector(".heat").style.color = "rgb(255, 69, 0)";
		look();
	} else {
		document.querySelector(".heat").style.color = "black";
		document.querySelector("#heatmap").style.opacity = 0;
	}
}

document.querySelector(".heat").onclick = heatButtonHandler;
document.querySelector(".eye").onclick = glanceButtonHandler;



/* EDITING EVENTS */

editor.on("text-change", _.debounce(function() {
	if (glance_view || heat_view) {
		look();
	}
}, 400));

editor.on("text-change", function(delta, oldDelta, source) {
//	if (!user_edited) {
//		user_edited = true;
//		console.log(delta);
//		editor.setContents(delta);
//		editor.setSelection()
//	}
//	
	if (glance_view) {
		unblur();
	}
	if (heat_view) {
		// hide overlay
		document.querySelector("#heatmap").style.opacity = 0;
	}
});