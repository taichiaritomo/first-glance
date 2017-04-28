/* Methods taken from a more recent version of jimp.js for CONVOLUTION */


function isNodePattern(cb) {
    if ("undefined" == typeof cb) return false;
    if ("function" != typeof cb)
        throw new Error("Callback must be a function");
    return true;
}

/**
 * Returns the offset of a pixel in the bitmap buffer
 * @param x the x coordinate
 * @param y the y coordinate
 * @param (optional) edgeHandling define how to sum pixels from outside the border
 * @param (optional) cb a callback for when complete
 * @returns the index of the pixel or -1 if not found
*/
Jimp.prototype.getPixelIndex = function (x, y, edgeHandling, cb) {
    var xi, yi;
    if ("function" == typeof edgeHandling && "undefined" == typeof cb) {
        cb = edgeHandling;
        edgeHandling = null;
    }
    if (!edgeHandling) edgeHandling = Jimp.EDGE_EXTEND;
    if ("number" != typeof x || "number" != typeof y)
        return throwError.call(this, "x and y must be numbers", cb);

    // round input
    xi = x = Math.round(x);
    yi = y = Math.round(y);

    if (edgeHandling = Jimp.EDGE_EXTEND) {
        if (x<0) xi = 0;
        if (x>=this.bitmap.width) xi = this.bitmap.width - 1;
        if (y<0) yi = 0;
        if (y>=this.bitmap.height) yi = this.bitmap.height - 1;
    }
    if (edgeHandling = Jimp.EDGE_WRAP) {
        if (x<0) xi = this.bitmap.width + x;
        if (x>=this.bitmap.width) xi = x % this.bitmap.width;
        if (y<0) xi = this.bitmap.height + y;
        if (y>=this.bitmap.height) yi = y % this.bitmap.height;
    }

    var i = (this.bitmap.width * yi + xi) << 2;

    // if out of bounds index is -1
    if (xi < 0 || xi >= this.bitmap.width) i = -1;
    if (yi < 0 || yi >= this.bitmap.height) i = -1;

    if (isNodePattern(cb)) return cb.call(this, null, i);
    else return i;
};

// Edge Handling
Jimp.EDGE_EXTEND = 1;
Jimp.EDGE_WRAP = 2;
Jimp.EDGE_CROP = 3;

/**
 * Adds each element of the image to its local neighbors, weighted by the kernel
 * @param kernel a matrix to weight the neighbors sum
 * @param (optional) edgeHandling define how to sum pixels from outside the border
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.convolution = function (kernel, edgeHandling, cb) {
    if ("function" == typeof edgeHandling && "undefined" == typeof cb) {
        cb = edgeHandling;
        edgeHandling = null;
    }
    if (!edgeHandling) edgeHandling = Jimp.EDGE_EXTEND;
    var newData = new Buffer(this.bitmap.data),
        weight, rSum, gSum, bSum, ri, gi, bi, xi, yi, idxi,
        kRows = kernel.length,
        kCols = kernel[0].length,
        rowEnd = Math.floor(kRows/2),
        colEnd = Math.floor(kCols/2),
        rowIni = -rowEnd,
        colIni = -colEnd;
    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        rSum = gSum = bSum = 0;
        for (row=rowIni; row<=rowEnd; row++) {
            for (col=colIni; col<=colEnd; col++) {
                xi = x + col;
                yi = y + row;
                weight = kernel[row+rowEnd][col+colEnd];
                idxi = this.getPixelIndex(xi, yi, edgeHandling);
                if (idxi == -1) ri = gi = bi = 0;
                else {
                    ri = this.bitmap.data[idxi+0];
                    gi = this.bitmap.data[idxi+1];
                    bi = this.bitmap.data[idxi+2];
                }
                rSum += weight * ri;
                gSum += weight * gi;
                bSum += weight * bi;
            }
        }
        if (rSum < 0) rSum = 0;
        if (gSum < 0) gSum = 0;
        if (bSum < 0) bSum = 0;
        if (rSum > 255) rSum = 255;
        if (gSum > 255) gSum = 255;
        if (bSum > 255) bSum = 255;
        newData[idx+0] = rSum;
        newData[idx+1] = gSum;
        newData[idx+2] = bSum;
    });
    this.bitmap.data = newData;
	return this;
}









/**
 * Returns the offset of a pixel in the bitmap buffer
 * @param x the x coordinate
 * @param y the y coordinate
 * @param (optional) edgeHandling define how to sum pixels from outside the border
 * @returns the index of the pixel or -1 if not found
*/
getPixelIndex = function (x, y, edgeHandling) {
    var xi, yi;

    if (edgeHandling = EDGE_EXTEND) {
        if (x<0)
			xi = 0;
        else if (x>=this.bitmap.width)
			xi = this.bitmap.width - 1;
        
		if (y<0)
			yi = 0;
        else if (y>=this.bitmap.height)
			yi = this.bitmap.height - 1;
    }

    var i = (this.bitmap.width * yi + xi);

    // if out of bounds index is -1
    if (xi < 0 || xi >= this.bitmap.width) i = -1;
    if (yi < 0 || yi >= this.bitmap.height) i = -1;
	
    return i;
};








/**
 * Scans through a region of the bitmap, calling a function for each pixel.
 * @param x the x coordinate to begin the scan at
 * @param y the y coordiante to begin the scan at
 * @param w the width of the scan region
 * @param h the height of the scan region
 * @param f a function to call on even pixel; the (x, y) position of the pixel
 * and the index of the pixel in the bitmap buffer are passed to the function
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.scan = function (x, y, w, h, f, cb) {
    if ("number" != typeof x || "number" != typeof y)
        return throwError.call(this, "x and y must be numbers", cb);
    if ("number" != typeof w || "number" != typeof h)
        return throwError.call(this, "w and h must be numbers", cb);
    if ("function" != typeof f)
        return throwError.call(this, "f must be a function", cb);

    // round input
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);

    for (var _y = y; _y < (y + h); _y++) {
        for (var _x = x; _x < (x + w); _x++) {
            var idx = (this.bitmap.width * _y + _x) << 2;
            f.call(this, _x, _y, idx);
        }
    }

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};
