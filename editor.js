/* Initialize Quill Editor */
var editor = new Quill("#editor", {
	modules: {
		toolbar: "#toolbar"
	},
	theme: "snow"
});


/* Set Initial Content */
//editor.setContents([
//	{
//		insert: "D4.1 - Development Update",
//		attributes: { bold: true }
//	},
//	{
//		insert: "\n\n"
//	},
//	{
//		insert: "Challenges\n",
//		attributes: { italic: true }
//	},
//	{
//		insert: "A simple linear string representation of text won’t suffice. I need to know the 2D position of "
//	},
//	{
//		insert: "each sentence",
//		attributes: { bold: true }
//	},
//	{
//		insert: " on the page/screen. This is not so easily accessible in Java."
//	},
//	{
//		insert: "\n\n"
//	},
//	{
//		insert: "Platform\n",
//		attributes: { italic: true }
//	},
//	{
//		insert: "QuillJS - Rich Text Editor API"
//	}
//]);


/* Testing shorter content */
editor.setContents([
	{
		insert: "Title",
		attributes: { size: "large" }
	},
	{
		insert: "\n\n"
	},
	{
		insert: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
	}
]);

//editor.setContents([
//	{
//		insert: "Hello! ",
//		attributes: { bold: true }
//	},
//	{
//		insert: "My name is Taichi."
//	}
//]);