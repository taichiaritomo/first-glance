/* Rasterize editor contents */
function rasterize() {
	var ql = document.querySelector(".ql-editor");
	domtoimage.toBlob(ql)
		.then(function (blob) {
//			var img = new Image();
//			img.src = dataUrl;
//			document.body.appendChild(img);
			console.log(blob);
			
			var reader = new FileReader();
			reader.addEventListener("loadend", function() {
				resize(reader.result);
			});
		
			reader.readAsArrayBuffer(blob);
		
			resize(blob);
		})
		.catch(function (error) {
			console.error('oops, something went wrong!', error);
		});
}

function resize(img) {
	
	Jimp.read(img).then( function (image) {
		console.log(image);
		image.resize(128,128)
		.getBase64(Jimp.MIME_PNG, function (err, src) {
			var img = new Image();
			img.src = src;
			document.body.appendChild(img);
		});
	}).catch( function (error) {
		console.error("error");
	});
	
}