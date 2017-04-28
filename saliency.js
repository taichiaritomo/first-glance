/* Spectral Residual JS
   author: Taichi Aritomo */



/* Converts an array of RGBA image data to grayscale
 * @param img an array of RGBA values
 * @param width the width of the image
 * @param height the height of the image
 * @returns the grayscale as an array of intensity values in [0,1]
 */
function grayscale(img, width, height) {
	var l = width * height * 4;
	var imageGray = [];
	
	for (var i = 0; i<l; i+=4) {
		var intensity = (0.2989 * img[i] + 0.5870 * img[i+1] + 0.1140 * img[i+2])/255;
		imageGray.push(intensity);
	}
	
	return imageGray;
}


/** Convolutes a grayscale (0-1) image with a given kernel matrix
 *  @param imageArray the input image, given as a linear array of intensity values
 *  @param w the width of the image
 *  @param h the height of the image
 *  @param kernel the kernel matrix, given as a square array of arrays
 *  @param trimExtremes a boolean indicating whether or not to trim values outside of the range [0,1]
 *  @returns the convoluted image as an array of grayscale values
 */
function convolution(imageArray, w, h, kernel, trimExtremes) {
	
	var newData = [],
        weight, i, sum, x_sample, y_sample, i_sample,
        kRows = kernel.length,
        kCols = kernel[0].length,
        rowEnd = Math.floor(kRows/2),
        colEnd = Math.floor(kCols/2),
        rowIni = -rowEnd,
        colIni = -colEnd;
	
	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			i = w*y + x; // find index of pixel at (x,y)
			
			sum = 0; // reset sampling sum
			
			// apply kernel
			for (var row = rowIni; row <= rowEnd; row++) {
				for (var col = colIni; col <= colEnd; col++) {
					// pixel to sample for each kernel element
					x_sample = x + col;
					y_sample = y + row;
					
					// "Extend" edges: sampling from outside the image bounds simply samples from the closest pixel on the edge
					x_sample = (x_sample<0 ? 0 : (x_sample>=w ? w-1 : x_sample));
					y_sample = (y_sample<0 ? 0 : (y_sample>=h ? h-1 : y_sample));
					
					i_sample = w*y_sample + x_sample;
					
					// add weighted sample to sum
					weight = kernel[row+rowEnd][col+colEnd];
					sum += weight * imageArray[i_sample];
				}
			}
			
			// trim values outside of [0,1]
			if (trimExtremes) {
				sum = (sum<0 ? 0 : (sum>=1 ? 1 : sum));
			}
			
			newData[i] = sum; // add to result data
		}
	}
	
	return newData;
}




/** Normalizes an array to values in the range [0-1]
 *  @param array
 *  @returns an array where each value is its intensity between the min and max element of the array
 */
function test_normalizeArray(array) {
	var l = array.length,
		v,
		min = Infinity,
		max = -Infinity,
		range,
		result = [];
	
	for (var i = 0; i < l; i++) {
		v = array[i];
		if (v < min) min = v;
		if (v > max) max = v;
	}
	range = max - min;
	
	for (var i = 0; i < l; i++) {
		v = array[i]
		result.push( (v - min)/range );
	}
	
	return result;
}


/** Computes the elementwise subtraction of two arrays
 *  @param array1 the array to subtract from
 *  @param array2 the array to subtract with
 *  @returns array1[] - array2[]
 */
function test_elementwiseSubtract(array1, array2) {
	var l = array1.length = array2.length,
		result = [];
	
	for (var i = 0; i < l; i++) {
		var diff = array1[i] - array2[i];
		result.push(diff);
	}
	
	return result;
}


/** Computes the elementwise square of an array
 *  @param array the input array
 *  @returns an array where each element has been squared
 */
function test_elementwiseSquare(array) {
	var l = array.length,
		result = [];
	
	for (var i = 0; i < l; i++) {
		result.push(array[i] * array[i]);
	}
	
	return result;
}




/** Computes the magnitude for an array of complex numbers
 *  @param re an array of real values
 *  @param im an array of corresponding imaginary values
 *  @returns an array of magnitudes
 */
function test_magnitude(re, im) {
	var l = re.length = im.length,
		mag,
		mags = [];
	
	for (var i = 0; i < l; i++) {
		mag = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
		mags.push(mag);
	}
	
	return mags;
}


/** Computes phase angle of an array of complex numbers
 *  @param re an array of real values
 *  @param im an array of corresponding imaginary values
 *  @returns an array of phase angle values
 */
function test_phaseAngle(re, im) {
	var l = re.length = im.length;
	var phase = [];
	for (var i = 0; i < l; i++) {
		phase.push(Math.atan2(im[i], re[i]));
	}
	return phase;
}


/** Computes the complex exponential of an array of complex numbers
 *  @param re an array of real values
 *  @param im an array of corresponding imaginary values
 *  @returns an object containing the resulting re and im arrays
 */
function test_complexExponential(re, im) {
	var l = re.length = im.length,
		e_x, y,
		e_re = [],
		e_im = [];
	
	for (var i = 0; i < l; i++) {
		e_x = Math.exp(re[i]);
		y   = im[i];
		
		e_re.push(e_x * Math.cos(y));
		e_im.push(e_x * Math.sin(y));
	}
	
	var result = new Object();
	result.re = e_re;
	result.im = e_im;
	return result;
}




/* Returns the average value in the given area of the saliency map
 * @params s_map a 128x128 saliency map, represented as an array of grayscale (0-1) values
 * @params x the x coordinate of the top left corner of the sampling area
 * @params y the y coordinate of the top left corner of the sampling area
 * @params w the width of the sampling area
 * @params h the height of the sampling area
 * @returns the average value of the pixels inside the given sampling area
 */
function sampleMap(s_map, x, y, w, h) {
	var mapSize = 64, // assuming map is square
		d = 8,
		maxY = Math.ceil(y+h),
		maxX = Math.ceil(x+w),
		i,
		sum = 0;
	
	for (i_y = Math.floor(y); i_y <= maxY; i_y++) {
		for (i_x = Math.floor(x); i_x <= maxX; i_x++) {
			i = mapSize*i_y + i_x;
			sum += s_map[i];
		}
	}
	
	var avg = sum/(w*h);
	return avg;
}




/* Creates saliency map, INCLUDES FILTER METHODS
 * @param img an array of grayscale (0-1) image data 
 * @param width the width of the image
 * @param height the height of the image
 * @returns a saliency map as an array of grayscale (0-1) image data
 */
function test_saliency(img, width, height) {
	var w = width,
		h = height,
		re = [],
		im = [];
	
	FFT.init(w);
	FrequencyFilter.init(w);
	SpectrumRenderer.init(w); // spectrum will be rendered as a square of the width
	
	var filter_radius = 30,
		i = 0,
		val = 0,
		p = 0;
	
	// initialize real and imaginary image data
	for (var px = 0; px < w*h; px++) {
		re.push(img[px]); // WARNING: taking only red value for grayscale intensity
		im.push(0.0);
	}
	
	FFT.fft2d(re,im); // TODO: Create simplified FFT implementation

	/* For later: Apply filters: */
	// FrequencyFilter.swap(re, im); // swap quadrants
	// FrequencyFilter.HPF(re, im, radius); // High pass filter
	// FrequencyFilter.swap(re, im);
	// FFT.ifft2d(re,im);
	
	
	
	/* WARNING: using w for both width and height (assuming square)
	   Need to look into whether or not rectangular images will work
	   whether or not we need rectangular image support */
	
	// Get log spectrum
	var logAmplitude = SpectrumRenderer.render(re, im, true);
	test_renderGS(logAmplitude, w, w);
	
	// Get phase angle
	var phase = test_phaseAngle(re, im);
    // test_renderGS(phase, w, w);
	
	// Convolute logAmplitude with average-filter
	var avgLogAmplitude = convolution(logAmplitude, w, w, AVG_5, false);
	test_renderGS(avgLogAmplitude, w, w);
	
	// Compute spectral residual by subtracting averaged log amplitude
	var spectralResidual = test_elementwiseSubtract(logAmplitude, avgLogAmplitude);
    // test_renderGS(spectralResidual, w, w);
	
	var complexResult = test_complexExponential(spectralResidual, phase);
	
	var final_re = complexResult.re;
	var final_im = complexResult.im;
	
	FFT.ifft2d(final_re, final_im);
    // test_renderGS(final_re, w, w);
	
	var abs = test_magnitude(final_re, final_im);
	
	var sq = test_elementwiseSquare(abs);
	
	var norm = test_normalizeArray(sq);
	
	test_renderGS(norm, w, h);
	
	return norm;
	
}



/* Creates saliency map.
 * WARNING: assumes input image is square and dimensions are radix-2
 * @param img an array of grayscale (0-1) image data
 * @param w the width of the image
 * @param h the height of the image
 * @returns a saliency map as an array of grayscale (0-1) image data
 */
function computeSaliency(img, w, h) {
	var re = [],
		im = [];
	
	// initialize real and imaginary image data
	for (var px = 0; px < w*h; px++) {
		re.push(img[px]);
		im.push(0.0);
	}
	
	/* WARNING: using w for both width and height (assuming square)
	   Need to look into whether or not rectangular images will work
	   whether or not we need rectangular image support */
	FFT.init(w);
	SpectrumRenderer.init(w);
	FFT.fft2d(re,im); // TODO: Create simplified FFT implementation
	
	var logAmplitude = SpectrumRenderer.render(re, im, true); // Get log spectrum
	var phase = test_phaseAngle(re, im); // Get phase angle
	var avgLogAmplitude = convolution(logAmplitude, w, w, AVG_5, false); // Convolute logAmplitude with average-filter
	var spectralResidual = test_elementwiseSubtract(logAmplitude, avgLogAmplitude); // Compute spectral residual by subtracting averaged log amplitude
	var complexExp = test_complexExponential(spectralResidual, phase);
	
	FFT.ifft2d(complexExp.re, complexExp.im);
	
	var abs = test_magnitude(complexExp.re, complexExp.im);
	var sq = test_elementwiseSquare(abs);
	var norm = test_normalizeArray(sq);
	
	return norm;
}