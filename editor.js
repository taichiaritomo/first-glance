/* Quill toolbar options */
//var toolbarOptions = [
//    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
//    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
//    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
//];

/* Initialize Quill Editor */
var editor = new Quill("#editor", {
	modules: {
		toolbar: "#toolbar",
        keyboard: {
          bindings: {
            tab: {
              key: 9,
              handler: function() {
                // do nothing
              }
            }
          }
        }
	},
    formats: ["background", "bold", "color", "italic", "size", "underline", "align"],
    scrollingContainer: "#editor-container",
	theme: "snow"
});


/* Testing shorter content */
//editor.setContents([
//	{
//		insert: ""
//	},
//	{
//		insert: "This is ",
//		attributes: { color: "#999999", italic: true, size: "large" }
//	},
//	{
//		insert: "Lookas",
//		attributes: { color: "#999999", bold: true, italic: true, size: "large" }
//	},
//	{
//		insert: "\na ",
//		attributes: { color: "#999999", bold: false, italic: true }
//	},
//	{
//		insert: "text-editing tool",
//		attributes: { color: "#999999", bold: true, italic: true }
//	},
//	{
//		insert: " that measures ",
//		attributes: { color: "#999999", italic: true }
//	},
//	{
//		insert: "visual saliency",
//		attributes: { color: "#999999", bold: true, italic: true }
//	},
//	{
//		insert: "\nto guide constructive thinking about information design.\n\nWhen we create written information, we can manipulate space, form, size, and color...which can be a lot to keep track of.\n\nSo Lookas shows you what stands out at first glance.",
//		attributes: { color: "#999999", italic: true }
//	}
//]);




var heat_view = true;
window.onload = function() {
    look();
    editor.setSelection(115, 0);
};

/* EDITING EVENTS */

var debouncedLook = _.debounce(function() {
    look();
}, 300);

editor.on("text-change", function(delta, oldDelta, source) {
    if (source == "user") {
        debouncedLook();
    }
});


var view_distance_setting = document.querySelector("#viewing-distance-setting");
var view_distance_num = document.querySelector("#viewing-distance-num");
var view_distance_icon_32 = document.querySelector(".viewing-distance-icon-32");
var view_distance_icon_64 = document.querySelector(".viewing-distance-icon-64");
var view_distance_icon_128 = document.querySelector(".viewing-distance-icon-128");
var view_distance = "1.0m"; // default view distance

function toggleViewDistance() {
    if (view_distance == "0.5m") {
        view_distance = "1.0m";
        mapSize = 64;
        view_distance_num.textContent = "1.0m";
        view_distance_icon_128.classList.remove("selected");
        view_distance_icon_64.classList.add("selected");
        look();
    } else if (view_distance == "1.0m") {
        view_distance = "2.0m";
        mapSize = 32;
        view_distance_num.textContent = "2.0m";
        view_distance_icon_64.classList.remove("selected");
        view_distance_icon_32.classList.add("selected");
        look();
    } else if (view_distance == "2.0m") {
        view_distance = "0.5m";
        mapSize = 128;
        view_distance_num.textContent = "0.5m";
        view_distance_icon_32.classList.remove("selected");
        view_distance_icon_128.classList.add("selected");
        look();
    }
}

view_distance_setting.addEventListener("click", function() {
    toggleViewDistance();
});

//editor.on("text-change", function(delta, oldDelta, source) {
////	if (glance_view && source == "user") {
////		unblur();
////	}
////	if (heat_view && source == "user") {
////		document.querySelector("#heatmap").style.opacity = 0; // hide overlay
////	}
//});

