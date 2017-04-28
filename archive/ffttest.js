/* Function called when test button is pressed */
function test_buttonHandler() {
    var spectrum = document.querySelector('#Spectrum').getContext('2d');
    var result = document.querySelector('#Result').getContext('2d');
    spectrum.fillStyle = '#ffffff';
    spectrum.fillRect(0, 0, spectrum.canvas.width, spectrum.canvas.height);
    result.fillStyle = '#ffffff';
    result.fillRect(0, 0, result.canvas.width, result.canvas.height);

    var image = new Image();
    image.src = 'test-img.png';
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
			FrequencyFilter.swap(re, im);
//			FrequencyFilter.HPF(re, im, radius);
			SpectrumViewer.render(re, im, true);
			FrequencyFilter.swap(re, im);
			
//                if (type == 'HPF') {
//                    FrequencyFilter.HPF(re, im, radius);
//                } else {
//                    FrequencyFilter.LPF(re, im, radius);
//                }
//                if (viewtype == "0") {
//                    SpectrumViewer.render(re, im, true);
//                } else {
//                    SpectrumViewer.render(re, im, false);
//                }

//			FrequencyFilter.swap(re, im);
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

document.querySelector("#test").onclick = test_buttonHandler;