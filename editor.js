/* Initialize Quill Editor */
var editor = new Quill("#editor", {
	modules: {
		toolbar: "#toolbar"
	},
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

//editor.setContents([
//    {
//		insert: "Notice: ",
//		attributes: { size: "large" }
//	},
//    {
//		insert: "Changes to Public Service Billing",
//		attributes: { size: "large", bold: true }
//	},
//    {
//        insert: "\nfor residents of Salt Lake City",
//        attributes: { bold: true }
//    },
//    {
//        insert: "\n\nCity meters are read and billed monthly."
//    },
//    {
//        insert: "\nBills include charges for water service, garbage pickup, sewer service, a storm water charge, and a franchise fee of 6% of the water and sewer charges.",
//        attributes: { color: "#999999" }
//    },
//    {
//        insert: "\n\nCustomers living outside city boundaries are billed for water service only."
//    },
//    {
//        insert: "\n\nBills are due 15 days after the mailing date. ",
//        attributes: { bold: true }
//    },
//    {
//        insert: "If service is terminated because of a past due bill or rules violations, before service is restored, a reconnection fee will be assessed and collected in addition to the delinquent amount."
//    }
//]);

var experiment_use_hotplate = true;

var glance_view = false,
	heat_view = false;

if (experiment_use_hotplate) {
    editor.setContents([
        {
            insert: "The Tool",
            attributes: { size: "large", color: "#666666", bold: true }
        },
        {
            insert: "\n\nYou will be using this simple text-editor.",
            attributes: { color: "#666666" }
        },
        {
            insert: "\n\nBehind your text, you'll see orange spots. The orange represents ",
            attributes: { color: "#666666" }
        },
        {
            insert: "visual saliency",
            attributes: { color: "#666666", bold: true }
        },
        {
            insert: ", the tendency for visual attention to be attracted to that location. As you make changes, the text-editor predicts what areas attract the most visual attention.",
            attributes: { color: "#666666", bold: false }
        },
        {
            insert: "\n\nYou can use the pin button to save a version of your work for comparison.",
            attributes: { color: "#666666" }
        }
    ]);
} else {
    editor.setContents([
        {
            insert: "The Tool",
            attributes: { size: "large", color: "#666666", bold: true }
        },
        {
            insert: "\n\nYou will be using this simple text-editor.",
            attributes: { color: "#666666" }
        },
        {
            insert: "\n\nYou can use the pin button to save a version of your work for comparison.",
            attributes: { color: "#666666" }
        }
    ]);
}


window.onload = function() {
//	document.querySelector(".ql-editor").focus();
    if (experiment_use_hotplate) {
        document.querySelector("#hotplate-button").click();
    } else {
        document.querySelector("#hotplate-button").style.display = "none";
    }
};


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
		document.querySelector("#hotplate-button").style.color = "rgb(255, 69, 0)";
		look();
	} else {
		document.querySelector("#hotplate-button").style.color = null;
		document.querySelector("#heatmap").style.opacity = 0;
	}
};

document.querySelector("#hotplate-button").onclick = heatButtonHandler;


/* Function called when test button is pressed */
//function glanceButtonHandler() {
//	// turn off heat view, if on
//	if (heat_view) {
//		document.querySelector(".heat").style.color = "black";
//		document.querySelector("#heatmap").style.opacity = 0;
//		heat_view = false;
//	}
//	
//	// switch glance_view
//	glance_view = !glance_view;
//	if (glance_view) {
//		document.querySelector(".eye").innerHTML = "&#9673;";
//		look();
//	} else {
//		document.querySelector(".eye").innerHTML = "&#9678;";
//		unblur();
//	}
//}

//document.querySelector(".eye").onclick = glanceButtonHandler;



/* EDITING EVENTS */

var debouncedLook = _.debounce(function() {
    look();
}, 200);

editor.on("text-change", function(delta, oldDelta, source) {
    if (source == "user") {
        debouncedLook();
    }
});

editor.on("text-change", function(delta, oldDelta, source) {
//	if (glance_view && source == "user") {
//		unblur();
//	}
	if (heat_view && source == "user") {
		document.querySelector("#heatmap").style.opacity = 0; // hide overlay
	}
});