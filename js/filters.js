  "use strict";

var Filters = Filters || {};



// space for general utility functions, if you want
var pi = 3.14159265359;

function clamp(val, min, max) {
  return val < min ? min : (val > max ? max : val);
}

// ----------- STUDENT CODE BEGIN ------------
// ----------- Our reference solution uses 77 lines of code.
// ----------- STUDENT CODE END ------------

// Return the luminance of the pixel
function lum(pixel) {
  return 0.2126 * pixel.data[0] + 0.7152 * pixel.data[1] + 0.0722 * pixel.data[2];
}

Filters.samplePixel = function ( image, x, y, mode ) {
  if ( mode == 'bilinear') {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 19 lines of code.
    var rx = Math.ceil(x) - x;
    var ry = Math.ceil(y) - y;
    var q11 = image.getPixel(Math.floor(x), Math.floor(y));
    var q12 = image.getPixel(Math.floor(x), Math.ceil(y));
    var q21 = image.getPixel(Math.ceil(x), Math.floor(y));
    var q22 = image.getPixel(Math.ceil(x), Math.ceil(y));
    var a = q11.multipliedBy(rx).plus(q21.multipliedBy(1-rx));
    var b = q12.multipliedBy(rx).plus(q22.multipliedBy(1-rx));
    return a.multipliedBy(ry).plus(b.multipliedBy(1-ry));
    // ----------- STUDENT CODE END ------------
  } else if ( mode == 'gaussian' ) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 37 lines of code.
    // sigma = 1, w = 3*sigma
    var sigma = 1;
    var winR = Math.round(sigma*3);
    var pixelout = new Pixel(0,0,0)
    var total = 0;
    var xlo = Math.ceil(x-winR);
    var xhi = Math.floor(x+winR);
    var ylo = Math.ceil(y-winR);
    var yhi = Math.floor(y+winR);
    for (var ix = xlo; ix <= xhi; ix++) {
      for (var iy = ylo; iy <= yhi; iy++) {
        if (ix >= 0 && ix < image.width && iy >= 0 && iy < image.height) {
          var dx = x-ix;
          var dy = y-iy;
          var pixelin = image.getPixel(ix, iy);
          var ratio = Math.exp(-(dx*dx+dy*dy)/(2*sigma*sigma));
          total += ratio;
          pixelout = pixelout.plus(pixelin.multipliedBy(ratio));
        }
      }
    }
    return pixelout.dividedBy(total);
    // ----------- STUDENT CODE END ------------

  } else { // point sampling

    y = Math.max( 0, Math.min(Math.round(y), image.height- 1) );
    x = Math.max( 0, Math.min(Math.round(x), image.width - 1) );
    return image.getPixel(x, y);
  }
}

Filters.fillFilter = function( image, color ) {
  image.fill(color);

  return image;
};

Filters.brightnessFilter = function( image, ratio ) {
  var alpha, dirLuminance;
  if (ratio < 0.0) {
    alpha = 1 + ratio;
    dirLuminance = 0;   // blend with black
  } else {
    alpha = 1 - ratio;
    dirLuminance = 1; // blend with white
  }

  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixel = image.getPixel(x, y);

      pixel.data[0] = alpha * pixel.data[0] + (1-alpha) * dirLuminance;
      pixel.data[1] = alpha * pixel.data[1] + (1-alpha) * dirLuminance;
      pixel.data[2] = alpha * pixel.data[2] + (1-alpha) * dirLuminance;

      image.setPixel(x, y, pixel)
    }
  }
  return image;
};

Filters.contrastFilter = function( image, ratio ) {
  // Reference: https://en.wikipedia.org/wiki/Image_editing#Contrast_change_and_brightening
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 14 lines of code.
  var avgLuminance = 0;
  for (var x = 0; x < image.width; x++) {
    for (var y = 0; y < image.height; y++) {
      var pixel = image.getPixel(x, y);
      avgLuminance += lum(pixel);
    }
  }
  avgLuminance /= (image.width * image.height);

  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixel = image.getPixel(x, y);
      for (var i = 0; i < pixel.data.length; i++) {
        pixel.data[i] = (pixel.data[i] - 0.5) * (Math.tan ((ratio + 1) * Math.PI/4) ) + 0.5;
      }
      image.setPixel(x, y, pixel);
    }
  }
  // ----------- STUDENT CODE END ------------

  return image;
};

Filters.gammaFilter = function( image, logOfGamma ) {
  var gamma = Math.exp(logOfGamma);

  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 12 lines of code.
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixel = image.getPixel(x,y);
      for (var i = 0; i < pixel.data.length; i++) {
        pixel.data[i] = Math.pow(pixel.data[i], gamma);
      }
      image.setPixel(x, y, pixel);
    }
  }
  // ----------- STUDENT CODE END ------------
  return image;

};

Filters.vignetteFilter = function( image, innerR, outerR ) {
  innerR = clamp(innerR, 0, outerR-0.1); // innerR should be at least 0.1 smaller than outerR
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 17 lines of code.
  var mx = image.width/2;
  var my = image.height/2;
  var diaDist = Math.sqrt(mx*mx + my*my);
  var ringW = outerR - innerR;
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixel = image.getPixel(x, y);
      var dx = x - mx;
      var dy = y - my;
      var distPastInner = Math.sqrt(dx*dx + dy*dy)/diaDist - innerR;
      if (distPastInner > 0) {
        var alpha = 1-distPastInner/ringW;
        for (var i = 0; i < pixel.data.length; i++) {
          pixel.data[i] = alpha * pixel.data[i];
        }
      }
      image.setPixel(x, y, pixel);
    }
  }
  // ----------- STUDENT CODE END ------------
  return image;
};

Filters.histogramEqualizationFilter = function( image ) {
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 31 lines of code.
  var NUM_LEVELS = 256;
  // generate histogram
  var hist = new Array(NUM_LEVELS);
  for (var i = 0; i < hist.length; i++) {
    hist[i] = 0;
  }
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixel = image.getPixel(x, y).rgbToHsl();
      hist[Math.round(pixel.data[2]*(NUM_LEVELS-1))] += 1;
    }
  }
  // generate cumulative histogram
  for (var i = 1; i < hist.length; i++) {
    hist[i] += hist[i-1];
  }
  // adjust values
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixel = image.getPixel(x, y).rgbToHsl();
      var newL = (hist[Math.round(pixel.data[2]*(NUM_LEVELS-1))] - hist[0])/(image.width*image.height - hist[0]);
      pixel.data[2] = newL;
      pixel = pixel.hslToRgb();
      pixel.clamp();
      image.setPixel(x, y, pixel);
    }
  }
  // ----------- STUDENT CODE END ------------
  return image;
};

Filters.grayscaleFilter = function( image ) {
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixel = image.getPixel(x, y);
      var luminance = lum(pixel);
      pixel.data[0] = luminance;
      pixel.data[1] = luminance;
      pixel.data[2] = luminance;

      image.setPixel(x, y, pixel);
    }
  }

  return image;
};

Filters.saturationFilter = function( image, ratio ) {
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 13 lines of code.
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixel = image.getPixel(x, y);
      var luminance = lum(pixel);
      pixel.data[0] += (pixel.data[0] - luminance) * ratio;
      pixel.data[1] += (pixel.data[1] - luminance) * ratio;
      pixel.data[2] += (pixel.data[2] - luminance) * ratio;

      image.setPixel(x, y, pixel);
    }
  }
  // ----------- STUDENT CODE END ------------
  return image;
};

Filters.whiteBalanceFilter = function( image, white ) {
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 23 lines of code.
  var whiteLms = white.rgbToXyz(white);
  whiteLms = whiteLms.xyzToLms(white);
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixel = image.getPixel(x, y);
      pixel = pixel.rgbToXyz();
      pixel = pixel.xyzToLms();
      pixel.data[0] /= whiteLms.data[0];
      pixel.data[1] /= whiteLms.data[1];
      pixel.data[2] /= whiteLms.data[2];
      pixel = pixel.lmsToXyz();
      pixel = pixel.xyzToRgb();
      image.setPixel(x, y, pixel);
    }
  }
  // ----------- STUDENT CODE END ------------
  return image;
};

Filters.histogramMatchFilter = function( image, refImg, value ) {
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 0 lines of code.
  // If value < 0.5 do RGB Histogram Matching
  var NUM_LEVELS = 256;
  if (value < 0.5) {
    var sizeRef = refImg.width*refImg.height;
    var sizeBase = image.width*image.height;
    // Generate histgram of reference image 
    var histRef = [new Array(NUM_LEVELS), new Array(NUM_LEVELS), new Array(NUM_LEVELS)];
    for (var i = 0; i < histRef.length; i++) {
      for (var j = 0; j < histRef[i].length; j++) {
        histRef[i][j] = 0;
      }
    }
    for (var y = 0; y < refImg.height; y++) {
      for (var x = 0; x < refImg.width; x++) {
        var pixel = refImg.getPixel(x, y);
        for (var i = 0; i < pixel.data.length; i++) {
          histRef[i][pixel.data[i]*(NUM_LEVELS-1)] += 1;
        }
      }
    }
    for (var i = 0; i < histRef.length; i++) {
      for (var j = 1; j < histRef[i].length; j++) {
        histRef[i][j] += histRef[i][j-1];
      }
    }

    // Generate histogram of base image
    var histBase = [new Array(NUM_LEVELS), new Array(NUM_LEVELS), new Array(NUM_LEVELS)];
    for (var i = 0; i < histBase.length; i++) {
      for (var j = 0; j < histBase[i].length; j++) {
        histBase[i][j] = 0;
      }
    }
    for (var y = 0; y < image.height; y++) {
      for (var x = 0; x < image.width; x++) {
        var pixel = image.getPixel(x, y);
        for (var i = 0; i < pixel.data.length; i++) {
          histBase[i][pixel.data[i]*(NUM_LEVELS-1)] += 1;
        }
      }
    }
    for (var i = 0; i < histBase.length; i++) {
      for (var j = 1; j < histBase[i].length; j++) {
        histBase[i][j] += histBase[i][j-1];
      }
    }

    // Create correspondance mapping from RGB values in base image to adjusted
    // RGB values from reference image with the same (approx) histogram values.
    var convertRGB = [new Array(NUM_LEVELS), new Array(NUM_LEVELS), new Array(NUM_LEVELS)];
    var indexRef;
    var indexBase;
    for (var i = 0; i < convertRGB.length; i++) {
      indexRef = 0;
      indexBase = 0;
      while (indexRef < NUM_LEVELS && indexBase < NUM_LEVELS) {
        while (histRef[i][indexRef]/sizeRef < histBase[i][indexBase]/sizeBase) {
          indexRef++;
        }
        convertRGB[i][indexBase] = indexRef;
        indexBase++;
      }
    }

    // Convert each pixel in the original image according to the convertRGB 
    // mapping
    for (var y = 0; y < image.height; y++) {
      for (var x = 0; x < image.width; x++) {
        var pixel = image.getPixel(x, y);
        for (var i = 0; i < pixel.data.length; i++) {
          pixel.data[i] = convertRGB[i][Math.round(pixel.data[i]*(NUM_LEVELS-1))]/(NUM_LEVELS-1);
        }
        image.setPixel(x, y, pixel);
      }
    }
  } 
  // If value >= 0.5 do Luminance Histogram Matching
  else {
    var sizeRef = refImg.width*refImg.height;
    var sizeBase = image.width*image.height;
    // Generate histogram of reference image 
    var histRef = new Array(NUM_LEVELS);
    for (var i = 0; i < histRef.length; i++) {
      histRef[i] = 0;
    }
    for (var y = 0; y < refImg.height; y++) {
      for (var x = 0; x < refImg.width; x++) {
        var pixel = refImg.getPixel(x, y);
        var luminance = lum(pixel);
        histRef[Math.round(luminance*(NUM_LEVELS-1))] += 1;
      }
    }
    for (var i = 1; i < histRef.length; i++) {
      histRef[i] += histRef[i-1];
    }

    // Generate histogram of base image 
    var histBase = new Array(NUM_LEVELS);
    for (var i = 0; i < histBase.length; i++) {
      histBase[i] = 0;
    }
    for (var y = 0; y < image.height; y++) {
      for (var x = 0; x < image.width; x++) {
        var pixel = image.getPixel(x, y);
        var luminance = lum(pixel);
        histBase[Math.round(luminance*(NUM_LEVELS-1))] += 1;
      }
    }
    for (var i = 1; i < histBase.length; i++) {
      histBase[i] += histBase[i-1];
    }

    // Create correspondance mapping from RGB values in base image to adjusted
    // RGB values from reference image with the same (approx) histogram values.
    var convertLum = new Array(NUM_LEVELS);
    var indexRef = 0;
    var indexBase = 0;
    while (indexRef < NUM_LEVELS && indexBase < NUM_LEVELS) {
      while (histRef[indexRef]/sizeRef < histBase[indexBase]/sizeBase) {
        indexRef++;
      }
      convertLum[indexBase] = indexRef;
      console.log("Convert: " + indexBase + ", " + indexRef)
      indexBase++;
    }


    // Convert each pixel in the original image according to the convertLum 
    // mapping
    for (var y = 0; y < image.height; y++) {
      for (var x = 0; x < image.width; x++) {
        var pixel = image.getPixel(x, y);
        var oldlum = lum(pixel);
        var newlum = convertLum[Math.round(oldlum*(NUM_LEVELS-1))]/(NUM_LEVELS-1);
        pixel = pixel.multipliedBy(newlum/oldlum);
        pixel.clamp();
        image.setPixel(x, y, pixel);
      }
    }
  }
  // ----------- STUDENT CODE END ------------
  return image;
};

Filters.gaussianFilter = function( image, sigma ) {
  // note: this function needs to work in a new copy of the image
  //       to avoid overwriting original pixels values needed later
  // create a new image with the same size as the input image
  var newImg = image.createImg(image.width, image.height);
  // the filter window will be [-winR, winR];
  var winR = Math.round(sigma*3);
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 54 lines of code.
  var newImgHalf = image.createImg(image.width, image.height);
  // Blur in the x dimension using the weighted combination of pixels in the
  // window inside the bounds of the image
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixelout = new Pixel(0,0,0)
      var total = 0;
      for (var dx = - winR; dx <= winR; dx++) {
        var nx = x+dx;
        if (nx >= 0 && nx < image.width) {
          var pixelin = image.getPixel(nx, y);
          var ratio = Math.exp(-dx*dx/(2*sigma*sigma));
          total += ratio;
          pixelout = pixelout.plus(pixelin.multipliedBy(ratio));
        }
      }
      pixelout = pixelout.dividedBy(total);
      newImgHalf.setPixel(x, y, pixelout);
    }
  }
  // Blur in the y dimension using the weighted combination of pixels in the
  // window inside the bounds of the image
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixelout = new Pixel(0,0,0)
      var total = 0;
      for (var dy = - winR; dy <= winR; dy++) {
        var ny = y+dy;
        if (ny >= 0 && ny < image.height) {
          var pixelin = newImgHalf.getPixel(x, ny);
          var ratio = Math.exp(-dy*dy/(2*sigma*sigma));
          total += ratio;
          pixelout = pixelout.plus(pixelin.multipliedBy(ratio));
        }
      }
      pixelout = pixelout.dividedBy(total);
      newImg.setPixel(x, y, pixelout);
    }
  }
  // ----------- STUDENT CODE END ------------
  return newImg;
};

Filters.edgeFilter = function( image ) {
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 51 lines of code.
  var newImg = image.createImg(image.width, image.height);
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixelout = newImg.getPixel(x,y);
      var total = [0,0,0];
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = - 1; dx <= 1; dx++) {
          var nx = x+dx;
          var ny = y+dy;
          if (nx >= 0 && nx < image.width && ny >= 0 && ny < image.height) {
            var pixelin = image.getPixel(nx,ny);
            for (var i = 0; i < pixelout.data.length; i++) {
              pixelout.data[i] -= pixelin.data[i];
              total[i]++;
            }
          }
        }
      }
      var pixelin = image.getPixel(x,y);
      for (var i = 0; i < pixelout.data.length; i++) {
        pixelout.data[i] += total[i] * pixelin.data[i];
      }
      newImg.setPixel(x, y, pixelout);
    }
  }
  // ----------- STUDENT CODE END ------------
  return newImg;
};

Filters.sharpenFilter = function( image ) {
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 29 lines of code.
  var newImg = image.createImg(image.width, image.height);
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixelout = new Pixel("#000000");
      // add the pixel's value to the one generated by edge filter
      var total = [1,1,1];
      for (var dy = - 1; dy <= 1; dy++) {
        for (var dx = - 1; dx <= 1; dx++) {
          var nx = x+dx;
          var ny = y+dy;
          if (nx >= 0 && nx < image.width && ny >= 0 && ny < image.height) {
            var pixelin = image.getPixel(nx,ny);
            for (var i = 0; i < pixelout.data.length; i++) {
              pixelout.data[i] -= pixelin.data[i];
              total[i]++;
            }
          }
        }
      }
      var pixelin = image.getPixel(x,y);
      for (var i = 0; i < pixelout.data.length; i++) {
        pixelout.data[i] += total[i] * pixelin.data[i];
      }
      newImg.setPixel(x, y, pixelout);
    }
  }
  // ----------- STUDENT CODE END ------------
  return newImg;
};

Filters.medianFilter = function( image, winR ) {
  // winR: the window will be  [-winR, winR];
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 31 lines of code.
  // median filter using luminance values
  /*
  var newImg = image.createImg(image.width, image.height);
    for (var y = 0; y < image.height; y++) {
  for (var x = 0; x < image.width; x++) {
      var vals = [];
      var count = 0;
      var pixelout = new Pixel("#000000");
        for (var dy = - winR; dy <= winR; dy++) {
      for (var dx = - winR; dx <= winR; dx++) {
          var nx = x+dx;
          var ny = y+dy;
          if (nx >= 0 && nx < image.width && ny >= 0 && ny < image.height) {
            vals.push(image.getPixel(nx,ny));
            count++;
          }
        }
      }
      vals.sort(function (a,b) {
        return lum(a) - lum(b);
      });
      newImg.setPixel(x, y, vals[Math.round(count/2)]);
    }
  }
  */
  // median filter using RGB values (warning: VERY SLOW)
  var newImg = image.createImg(image.width, image.height);
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var vals = [[],[],[]];
      var count = 0;
      var pixelout = new Pixel("#000000");
      for (var dy = - winR; dy <= winR; dy++) {
        for (var dx = - winR; dx <= winR; dx++) {
          var nx = x+dx;
          var ny = y+dy;
          if (nx >= 0 && nx < image.width && ny >= 0 && ny < image.height) {
            var pixelin = image.getPixel(nx,ny);
            for (var i = 0; i < pixelin.data.length; i++) {
              vals[i].push(pixelin.data[i]);
            }
            count++;
          }
        }
      }
      for (var i = 0; i < pixelout.data.length; i++) {
        vals[i].sort();
        pixelout.data[i] = vals[i][Math.round(count/2)];
      }
      newImg.setPixel(x, y, pixelout);
    }
  }
  // ----------- STUDENT CODE END ------------
  return newImg;
};

Filters.bilateralFilter = function( image, sigmaR, sigmaS ) {
  // reference: https://en.wikipedia.org/wiki/Bilateral_filter
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 48 lines of code.
  var newImg = image.createImg(image.width, image.height);
  // the filter window will be [-winR, winR];
  var winR = Math.round(Math.max(sigmaR,sigmaS)*3);
  // I had to adjust simgaR by dividing in order for it to work
  sigmaR = sigmaR/(Math.sqrt(2)*winR);
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixelout = new Pixel("#000000")
      var total = 0;
      var pixelOrig = image.getPixel(x,y);
      var lumOrig = lum(pixelOrig);
      for (var dy = - winR; dy <= winR; dy++) {
        for (var dx = - winR; dx <= winR; dx++) {
          var pixelin = image.getPixel(clamp(x+dx, 0, image.width-1), clamp(y+dy, 0, image.height-1));
          var lumin = lum(pixelin);
          var ratio = Math.exp(-(dx*dx + dy*dy)/(2*sigmaS*sigmaS)-(lumOrig - lumin)*(lumOrig - lumin)/(2*sigmaR*sigmaR));
          total += ratio;
          pixelout = pixelout.plus(pixelin.multipliedBy(ratio));
        }
      }
      pixelout = pixelout.dividedBy(total);
      newImg.setPixel(x, y, pixelout);
    }
  }
  // ----------- STUDENT CODE END ------------
  return newImg;
};

Filters.quantizeFilter = function( image, bitsPerChannel ) {
  var valuesPerChannel = Math.pow(2, bitsPerChannel)
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 12 lines of code.
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixel = image.getPixel(x,y);
      for (var i = 0; i < pixel.data.length; i++) {
        pixel.data[i] = Math.round(pixel.data[i]*(valuesPerChannel-1))/(valuesPerChannel-1);
      }
      image.setPixel(x, y, pixel);
    }
  }
  // ----------- STUDENT CODE END ------------
  return image;
};

Filters.randomFilter = function( image, bitsPerChannel ) {
  var valuesPerChannel = Math.pow(2, bitsPerChannel)
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 12 lines of code.
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixel = image.getPixel(x,y);
      for (var i = 0; i < pixel.data.length; i++) {
        pixel.data[i] += (Math.random()-0.5)/(valuesPerChannel-1);
        pixel.data[i] = Math.round(pixel.data[i]*(valuesPerChannel-1))/(valuesPerChannel-1);
      }
      image.setPixel(x, y, pixel);
    }
  }
  // ----------- STUDENT CODE END ------------
  return image;

};

Filters.orderedFilter = function( image, bitsPerChannel ) {
  var valuesPerChannel = Math.pow(2, bitsPerChannel)
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 31 lines of code.
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixel = image.getPixel(x,y);
      var matrix = [[15,7,13,5],[3,11,1,9],[12,4,14,6],[0,8,2,10]]
      var i = x % 4;
      var j = y % 4;
      var thresh = (matrix[i][j] + 1)/(17);
      for (var i = 0; i < pixel.data.length; i++) {
        pixel.data[i] += (thresh - 0.5)/(valuesPerChannel-1);
        pixel.data[i] = Math.round(pixel.data[i]*(valuesPerChannel-1))/(valuesPerChannel-1);
        pixel.clamp();
      }
      image.setPixel(x, y, pixel);
    }
  }
  // ----------- STUDENT CODE END ------------
  return image;

};

Filters.floydFilter = function( image, bitsPerChannel ) {
  var valuesPerChannel = Math.pow(2, bitsPerChannel)
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 23 lines of code.
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixel = image.getPixel(x,y);
      var pixelR = image.getPixel(x+1,y);
      var pixelLD = image.getPixel(x-1,y+1);
      var pixelD = image.getPixel(x,y+1);
      var pixelRD = image.getPixel(x+1,y+1);
      for (var i = 0; i < pixel.data.length; i++) {
        var newVal = Math.round(pixel.data[i]*(valuesPerChannel-1))/(valuesPerChannel-1);
        var error = pixel.data[i] - newVal;
        pixel.data[i] = newVal;
        // disperse error
        if (x < image.width-1) { pixelR.data[i] += error*7/16; image.setPixel(x+1, y, pixelR); }
        if (x > 1 && y < image.height-1) { pixelLD.data[i] += error*3/16; image.setPixel(x-1, y+1, pixelLD); }
        if (y < image.height-1) { pixelD.data[i] += error*5/16; image.setPixel(x, y+1, pixelD); }
        if (x < image.width-1 &&y < image.height-1) { pixelRD.data[i] += error*1/16; image.setPixel(x+1, y+1, pixelRD); }
        pixel.clamp();
      }
      image.setPixel(x, y, pixel);
    }
  }
  // ----------- STUDENT CODE END ------------
  return image;
};

Filters.scaleFilter = function( image, ratio, sampleMode ) {
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 19 lines of code.
  var newImg = image.createImg(Math.round(image.width*ratio), Math.round(image.height*ratio));
  for (var y = 0; y < newImg.height; y++) {
    for (var x = 0; x < newImg.width; x++) {
      var pixel = Filters.samplePixel(image, x/ratio, y/ratio, sampleMode);
      newImg.setPixel(x, y, pixel);
    }
  }
  // ----------- STUDENT CODE END ------------
  return newImg;
};

Filters.translateFilter = function( image, x, y, sampleMode ) {
  // Note: set pixels outside the image to RGBA(0,0,0,0)
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 21 lines of code.
  var nx = image.width + x;
  var ny = image.height + y;
  var newImg = image.createImg(nx,ny);
  for (var dy = 0; dy < newImg.height; dy++) {
    for (var dx = 0; dx < newImg.width; dx++) {
      var pixel = new Pixel(0,0,0,0);
      if (dx >= x && dy >= y)
        pixel = Filters.samplePixel(image, dx - x, dy - y, sampleMode);
      newImg.setPixel(dx, dy, pixel);
    }
  }
  // ----------- STUDENT CODE END ------------
  return newImg;
};

Filters.rotateFilter = function( image, radians, sampleMode ) {
  // Note: set pixels outside the image to RGBA(0,0,0,0)
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 30 lines of code.
  // width and height of new image
  var nw, nh;
  var cval = Math.cos(radians);
  var sval = Math.sin(radians);
  // calculate new width and height
  if (radians%(Math.PI/2) < Math.PI/2) {
    nw = Math.round(image.width*Math.abs(cval) + image.height*Math.abs(sval));
    nh = Math.round(image.width*Math.abs(sval) + image.height*Math.abs(cval));
  } else {
    nw = Math.round(image.width*Math.abs(sval) + image.height*Math.abs(cval));
    nh = Math.round(image.width*Math.abs(cval) + image.height*Math.abs(sval));
  }
  var newImg = image.createImg(nw,nh);
  // coordinates of the center of the source image
  var cu = image.width/2;
  var cv = image.height/2;
  // coordinates of the center of the new image
  var cx = nw/2;
  var cy = nh/2;
  for (var y = 0; y < newImg.height; y++) {
    for (var x = 0; x < newImg.width; x++) {
      var pixel = new Pixel(0,0,0,0);
      // x and y in new image with cx and cy as the origin
      var ax = x - cx;
      var ay = y - cy;
      // x and y in source image with cu and cv as the origin
      var au = ax*cval + ay*sval;
      var av = -ax*sval + ay*cval;
      // x and y in source image with top left corner as the origin
      var u = au + cu;
      var v = av + cv;
      // if (x,y) is within the original image, sample it
      if (u >= 0 && u < image.width && v >= 0 && v < image.height) {
        pixel = Filters.samplePixel(image, u, v, sampleMode);
      }
      newImg.setPixel(x, y, pixel);
    }
  }
  // ----------- STUDENT CODE END ------------
  return newImg;
};

Filters.swirlFilter = function( image, radians, sampleMode ) {
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 27 lines of code.
  var newImg = image.createImg(image.width, image.height);
  var cx = image.width/2;
  var cy = image.height/2;
  var scale = 5;
  for (var y = 0; y < newImg.height; y++) {
    for (var x = 0; x < newImg.width; x++) {
      var pixel = new Pixel(0,0,0,0);
      // x and y in new image with cx and cy as the origin
      var ax = (x - cx)/cx;
      var ay = (y - cy)/cy;
      // the "radius", i.e. the distance from the center to (x,y)
      var r = Math.sqrt(ax*ax+ay*ay);
      var au = (x-cx)*Math.cos(scale*r*radians)-(y-cy)*Math.sin(scale*r*radians);
      var av = (x-cx)*Math.sin(scale*r*radians)+(y-cy)*Math.cos(scale*r*radians);
      // x and y in source image with top left corner as the origin
      var u = clamp(au + cx, 0, image.width-1);
      var v = clamp(av + cy, 0, image.height-1);
      // if (x,y) is within the original image, sample it
      pixel = Filters.samplePixel(image, u, v, sampleMode);
      newImg.setPixel(x, y, pixel);
    }
  }
  // ----------- STUDENT CODE END ------------
  return newImg;
};

Filters.getAlphaFilter = function( backgroundImg, foregroundImg) {
  for (var i = 0; i < backgroundImg.height; i++) {
    for (var j = 0; j < backgroundImg.width; j++) {
      var pixelBg = backgroundImg.getPixel(j, i);
      var pixelFg = foregroundImg.getPixel(j, i);
      var luminance = lum(pixelFg);
      pixelBg.a = luminance;
      backgroundImg.setPixel(j, i, pixelBg);
    }
  }

  return backgroundImg;
};

Filters.compositeFilter = function( backgroundImg, foregroundImg ) {
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 14 lines of code.
  for (var i = 0; i < backgroundImg.height; i++) {
    for (var j = 0; j < backgroundImg.width; j++) {
      var pixelBg = backgroundImg.getPixel(j, i);
      var pixelFg = foregroundImg.getPixel(j, i);
      var a = pixelFg.a;
      pixelBg = pixelBg.multipliedBy(1-a);
      pixelFg = pixelFg.multipliedBy(a);
      backgroundImg.setPixel(j, i, pixelBg.plus(pixelFg));
    }
  }
  // ----------- STUDENT CODE END ------------
  return backgroundImg;
};

// sum of two vectors
function plus(vector1, vector2) {
  return ({
    x: vector1.x + vector2.x,
    y: vector1.y + vector2.y
  });
}

// difference of two vectors
function minus(vector1, vector2) {
  return ({
    x: vector1.x - vector2.x,
    y: vector1.y - vector2.y
  });
}

// perpendicular vector of identical magnitude
function perp(vector) {
  return ({
    x: vector.y,
    y: -vector.x
  })
}

// scaled vector
function scale(vector, scale) {
  return ({
    x: scale*vector.x,
    y: scale*vector.y
  });
}

// dot product of two vectors
function dot(vector1, vector2) {
  return vector1.x*vector2.x+vector1.y*vector2.y;
}

// warp the image given the sampleMode, the lines defining the source image
// and their corresponding lines defining the destination image
function warp(image, sampleMode, linesSrc, linesDst) {
  var warp = image.createImg(image.width, image.height);
  for (var y = 0; y < warp.height; y++) {
    for (var x = 0; x < warp.width; x++) {
      var w = {x: 0, y: 0};
      var wsum = 0;
      var point = {x: x, y: y};
      for (var i = 0; i < linesDst.length; i++) {
        var p = {x: linesDst[i].y0, y: linesDst[i].x0};
        var q = {x: linesDst[i].y1, y: linesDst[i].x1};
        var xmp = minus(point, p);
        var xmq = minus(point, q);
        var qmp = minus(q,p);
        var qpLen = Math.sqrt(dot(qmp,qmp));
        var u = dot(xmp,qmp)/dot(qmp,qmp);
        var v = dot(xmp,perp(qmp))/qpLen;

        var pP = {x: linesSrc[i].y0, y: linesSrc[i].x0};
        var qP = {x: linesSrc[i].y1, y: linesSrc[i].x1};
        var qPmpP = minus(qP,pP);
        var xP = plus(pP,
          plus(scale(qPmpP,u),
            scale(perp(qPmpP), 
              v/Math.sqrt(dot(qPmpP,qPmpP)))));
        var d = minus(xP,point);
        var dist = Math.abs(v);
        if (u < 0) dist = Math.sqrt(dot(xmp,xmp));
        else if (u > 1) dist = Math.sqrt(dot(xmq,xmq));
        var weight = Math.pow(Math.pow(qpLen,0.5)/(0.01+dist), 2);
        w = plus(w,scale(d,weight));
        wsum += weight;
      }
      var xSrc = plus(point,scale(w,1/wsum));
      warp.setPixel(x,y,Filters.samplePixel(image, xSrc.x, xSrc.y, sampleMode));
    }
  }
  return warp;
}

Filters.morphFilter = function( initialImg, finalImg, alpha, sampleMode, linesFile ) {
  var lines = Parser.parseJson( "images/" + linesFile );
  var temp = lines.initial[0];

  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 83 lines of code.
  var image = initialImg.createImg(initialImg.width, initialImg.height);

  // generate the intermediate set of lines based on alpha
  var iLines = [];
  for (var i = 0; i < lines.initial.length; i++) {
    iLines.push({
      x0: lines.initial[i].x0*(1-alpha) + lines.final[i].x0*alpha,
      y0: lines.initial[i].y0*(1-alpha) + lines.final[i].y0*alpha,
      x1: lines.initial[i].x1*(1-alpha) + lines.final[i].x1*alpha,
      y1: lines.initial[i].y1*(1-alpha) + lines.final[i].y1*alpha
    });
  }

  // generate the two warps
  var warpI = warp(initialImg, sampleMode, lines.initial, iLines);
  var warpF = warp(finalImg, sampleMode, lines.final, iLines);

  // take a weighted average of the two warps based on alpha
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      image.setPixel(x,y,warpI.getPixel(x,y).multipliedBy(1-alpha).plus(warpF.getPixel(x,y).multipliedBy(alpha)));
    }
  }
  // ----------- STUDENT CODE END ------------
  return image;
};

Filters.brushFilter = function( image, radius, color, vertsString ) {
  // extract vertex coordinates from the URL string.
  var centers = [];
  var coordStrings = vertsString.split("x");
  var coordsSoFar = 0;
  for (var i = 0; i < coordStrings.length; i++) {
    var coords = coordStrings[i].split("y");
    var x = parseInt(coords[0]);
    var y = parseInt(coords[1]);
    if (!isNaN(x) && !isNaN(y)) {
      centers.push({
        x: x,
        y: y,
      });
    }
  }

  // draw a filled circle centered at every location in centers[].
  // radius and color are specified in function arguments.
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 10 lines of code.
  var radiusSquare = radius * radius;
  for (var z = 0; z < centers.length; z++) {
    for (var dy = 0; dy < radius; dy++) {
      for (var dx = 0; dx < radius; dx++) {
        // if within circle, color the pixel
        if (dx*dx + dy*dy < radiusSquare) {
          image.setPixel(centers[z].x + dx, centers[z].y + dy, color);
          image.setPixel(centers[z].x + dx, centers[z].y - dy, color);
          image.setPixel(centers[z].x - dx, centers[z].y + dy, color);
          image.setPixel(centers[z].x - dx, centers[z].y - dy, color);
        }
      }
    }
  }
  // ----------- STUDENT CODE END ------------

  return image;
};

// get the squared distance between 2 pixels
function squaredDist(pixel1, pixel2) {
  var sDist = 0;
  for (var i = 0; i < pixel1.data.length; i++) {
    var dif = (pixel1.data[i]-pixel2.data[i]);
    sDist += dif*dif;
  }
  return sDist;
}

// create an array of size num holding empty arrays
function arrayOfEmptyArrays(num) {
  var output = [];
  for (var i = 0; i < num; i++) output.push([]);
    return output;
}

Filters.paletteFilter = function( image, colorNum ) {
  // ----------- STUDENT CODE BEGIN ------------
  // ----------- Our reference solution uses 83 lines of code.
  var PALETTE_WIDTH = 80;
  var newImg = image.createImg(image.width + PALETTE_WIDTH, image.height);
  var colors = []; // the means
  var clusters = arrayOfEmptyArrays(colorNum);; // the clusters
  var stabilized = false; // if the k-means clustering algorithm has stabilized

  // Randomly partition the data set into clusters
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixel = image.getPixel(x,y);
      clusters[Math.floor(Math.random()*colorNum)].push(pixel);
    }
  }

  // while data is still changing cluster locations...
  while (!stabilized) {
    stabilized = true;
    // calculate the new means as the centroid of each cluster
    var tempColors = [];
    for (var i = 0; i < clusters.length; i++) {
      if (clusters[i].length != 0) {
        var pixel = new Pixel(0,0,0);
        for (var j = 0; j < clusters[i].length; j++) 
          pixel = pixel.plus(clusters[i][j]);
        tempColors.push(pixel.dividedBy(clusters[i].length));
      } else tempColors.push(new Pixel(Math.random(),Math.random(),Math.random()));
    }
    colors = tempColors;
    // assign each pixel to its new cluster
    var tempClusters = arrayOfEmptyArrays(colorNum);
    for (var i = 0; i < colors.length; i++) {
      for (var j = 0; j < clusters[i].length; j++) {
        var pixel = clusters[i][j];
        var bestSDist = squaredDist(pixel, colors[0]);
        var bestIndex = 0;
        for (var k = 1; k < colors.length; k++) {
          var curSDist = squaredDist(pixel, colors[k]);
          if (curSDist < bestSDist) {
            bestSDist = curSDist;
            bestIndex = k;
          } 
        }
        // if a pixel changes cluster, set stabilized to false
        if (bestIndex != i) stabilized = false;
        tempClusters[bestIndex].push(pixel);
      }
    }
    clusters = tempClusters;
  }
  // Draw the original picture
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      newImg.setPixel(x,y,image.getPixel(x,y));
    }
  }
  // Draw the palette
  for (var i = 0; i < colors.length; i++) {
    for (var y = 0; y < image.height/colors.length; y++) {
      for (var x = 0; x < PALETTE_WIDTH; x++) {
        newImg.setPixel(image.width+x,i*Math.round(image.height/colors.length)+y,colors[i]);
      }
    }
  }
  // ----------- STUDENT CODE END ------------
  return newImg;
};

/******************************************************************************/
/******************************************************************************/
/****************************START OF FINAL PROJECT****************************/
/******************************************************************************/
/******************************************************************************/

// randomly shuffles an array.
// Code found at https://www.frankmitchell.org/2015/01/fisher-yates/
function shuffle (array) {
  var i = 0
  var j = 0
  var temp = 0

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

// used to sort in descending order
function sortDesc(a,b) {
  return b-a;
}

// return w*h grid of -1's
function negGrid(w,h) {
  var grid = [];
  for (var i = 0; i < w; i++) {
    var col = [];
    for (var j = 0; j < h; j++) {
      col.push(-1);
    }
    grid.push(col);
  }
  return grid;
}

// returns true if (x,y) is out of image bounds
function outOfBounds(image, x, y) {
  if (x < 0 || y < 0 || x > image.width-1 || y > image.height-1) 
    return true;
  return false;
}

// get the squared distance between 2 pixels
function pSquaredDist(pixel1, pixel2) {
  if (pixel1.a == 0 || pixel2.a == 0) return Number.MAX_SAFE_INTEGER;
  var sDist = 0;
  for (var i = 0; i < pixel1.data.length; i++) {
    var dif = (pixel1.data[i]-pixel2.data[i]);
    sDist += dif*dif;
  }
  return sDist;
}

// paints a spattered circle of radius r at x,y on canvas based on blurImg
function paintCircle(canvas, blurImg, x, y, r, zval, zbuf, color, A) {
  var aColor = color.multipliedBy(A);
  if (x < 0 || y < 0 || x > canvas.width - 1 || y > canvas.height - 1) return;
  var radiusSquare = r * r;
  // if (!color) color = blurImg.getPixel(x,y);
  for (var dy = -r+1; dy < r; dy++) {
    for (var dx = -r+1; dx < r; dx++) {
      // if (Math.random()*(1-Math.sqrt(dx*dx+dy*dy)/r) > .05)
      var ax = Math.floor(x + dx);
      var ay = Math.floor(y + dy);
      var cVal = 1-Math.sqrt(dx*dx+dy*dy)/r; // 1 at center, 0 at edge
      if (ax >= 0 && ay >= 0 && ax < canvas.width && ay < canvas.height && 
          zval > zbuf[ax][ay] && cVal > 0) {
        // var A2 = A*Math.sqrt(cVal);
        // var aColor = color.multipliedBy(A2);
        zbuf[ax][ay] = zval;
        if (A != 1) {
          if (canvas.getPixel(ax,ay).a == 0) {
            canvas.setPixel(ax, ay, color);
          }
          var oaColor = canvas.getPixel(ax,ay).multipliedBy(1-A);
          canvas.setPixel(ax, ay, aColor.plus(oaColor));
        } else {
          canvas.setPixel(ax, ay, color);
        }
      }
    }
  }
}

// convolution masking at x,y window size d*d, mask provided by double array mask
// d must be odd
function convomask(image, x, y, d, mask) {
  var output = 0;
  for (var dy = 0; dy < d; dy++) {
    for (var dx = 0; dx < d; dx++) {
      var rdx = dx - (d-1)/2;
      var rdy = dy - (d-1)/2;
      if (x+rdx >= 0 && x+rdx < image.width && y+rdy >= 0 && y+rdy < image.height) {
        output+=mask[dx][dy]*lum(image.getPixel(x+rdx,y+rdy));
      }
    }
  }
  return output
}

// calculate normalized vector
function norm(gx,gy) {
  var length = Math.sqrt(gx*gx + gy*gy)
  if (length == 0) return {x: 0, y: 0};
  // return [gx/length, gy/length];
  return {x: gx/length, y: gy/length};
}

// function that returns vector in the direction normal to the gradient
function nGrad(image, x, y, d) {
  var xMask = [[-1,-2,-1],[0,0,0],[1,2,1]];
  var yMask = [[1,0,-1],[2,0,-2],[1,0,-1]];
  var gx = convomask(image, x, y, d, xMask);
  var gy = convomask(image, x, y, d, yMask);
  return norm(gy,gx);
}

// generates the grid of gradients of an image
function genGraGrid(blurImg) {
  var grid = [];
  for (var x = 0; x < blurImg.width; x++) {
    grid.push([]);
    for (var y = 0; y < blurImg.height; y++) {
      grid[x].push(nGrad(blurImg, x, y, 3));
    }
  }
  return grid;
}

// multiply a vector {x, y} by c
function mulVec(v, c) {
  return {x: v.x*c, y: v.y*c};
}

// add two vectors v, w 
function addVecs(v,w) {
  return {x: v.x + w.x, y: v.y  + w.y};
}

function sampleGrid(grid, x, y) {
  var rx = Math.ceil(x) - x;
  var ry = Math.ceil(y) - y;
  var q11 = grid[Math.floor(x)][Math.floor(y)];
  var q12 = grid[Math.floor(x)][Math.ceil(y)];
  var q21 = grid[Math.ceil(x)][Math.floor(y)];
  var q22 = grid[Math.ceil(x)][Math.ceil(y)];
  var a = addVecs(mulVec(q11,rx), mulVec(q21,(1-rx)));
  var b = addVecs(mulVec(q12,rx), mulVec(q22,(1-rx)));
  return addVecs(mulVec(a,ry),mulVec(b,(1-ry)));
}

// calculates the average RGB distance from the pixels around xpos,ypos
// within the box of radius r
function avgDifference(canvas, difGrid, xpos, ypos, r) {
  var sum = 0;
  var count = 0;
  var ax = Math.floor(xpos);
  var ay = Math.floor(ypos);
  var lx = Math.round(xpos - r/2);
  var ly = Math.round(ypos - r/2);
  var ux = Math.round(xpos + r/2);
  var uy = Math.round(ypos + r/2);
  var dMax = difGrid[ax][ay];
  var coords = [ax, ay]
  for (var y = ly; y <= uy; y++) {
    for (var x = lx; x <= ux; x++) {
      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        if (difGrid[x][y] > dMax) {
          dMax = difGrid[x][y];
          coords = [x,y]
        }
        sum += difGrid[x][y];
        count++;
      }
    }
  }
  return [sum/count,coords];
}

// generates the grid of differences in terms of RGB distance
function genDifGrid(canvas,blurImg) {
  var grid = [];
  for (var x = 0; x < blurImg.width; x++) {
    grid.push([]);
    for (var y = 0; y < blurImg.height; y++) {
      var pixel1 = canvas.getPixel(x,y);
      var pixel2 = blurImg.getPixel(x,y);
      grid[x].push(255*Math.sqrt(pSquaredDist(pixel1,pixel2)));
    }
  }
  return grid;
}

// make a stroke
function makeStroke(r, x, y, blurImg) {
  return {r: r, x: x, y: y, g: nGrad(blurImg, x, y, 3)};
}

function makeSplineStroke(r, x0, y0, canvas, blurImg, graGrid, minL, maxL, FC, jit) {
  var color = Filters.samplePixel(blurImg, x0, y0, 'bilinear');
  if (jit[0] != 0 || jit[1] != 0 || jit[2] != 0) {
    color = color.rgbToHsl();
    color.data[0] += (Math.random()-0.5)*jit[0];
    color.data[1] += (Math.random()-0.5)*jit[1];
    color.data[2] += (Math.random()-0.5)*jit[2];
    color = color.hslToRgb();
    color.clamp();
  }
  if (jit[3] != 0 || jit[4] != 0 || jit[5] != 0) {
    color.data[0] += (Math.random()-0.5)*jit[3];
    color.data[1] += (Math.random()-0.5)*jit[4];
    color.data[2] += (Math.random()-0.5)*jit[5];
    color.clamp();
  }
  var controlPoints = [{x: x0, y: y0}];
  var x = x0;
  var y = y0;
  var lDx = 0;
  var lDy = 0;
  for (var i = 0; i < maxL; i++) {
    var curCol = Filters.samplePixel(blurImg, x, y, 'bilinear');
    var canCol = Filters.samplePixel(canvas, x, y, 'bilinear');
    if (i >= minL && pSquaredDist(curCol, canCol) < pSquaredDist(curCol, color)) {
      return {color: color, r: r, cPoints: controlPoints};
    }
    var g = sampleGrid(graGrid,x,y);
    var dx = g.x;
    var dy = g.y;

    if (dx == 0 && dy == 0) 
      return {color: color, r: r, cPoints: controlPoints};

    if (lDx * dx + lDy * dy < 0) {
      dx = -dx;
      dy = -dy;
    }

    dx = FC*dx + (1-FC)*lDx;
    dy = FC*dy + (1-FC)*lDy;
    var dlen = Math.sqrt(dx*dx + dy*dy);
    dx = dx/dlen;
    dy = dy/dlen;

    x += r*dx;
    y += r*dy;
    if (outOfBounds(canvas, x, y)) {
      return {color: color, r: r, cPoints: controlPoints};
    }

    lDx = dx;
    lDy = dy;
    controlPoints.push({x: x, y: y});
  }
  return {color: color, r: r, cPoints: controlPoints};
}

// convert percent along the stroke to percent of total brush radius
function brushStyle(pct) {
  // if (pct == 0.5) return 1;
  // else return 0;
  return 1;
  // return 1-2*Math.abs(0.5 - pct);
  // return Math.abs(Math.cos(pct*2*Math.PI));
  // return pct;
}

// draw the stroke on the canvas
function renderStroke(canvas, blurImg, stroke, zval, zbuf) {
  var fac = 2;
  var color = blurImg.getPixel(stroke.x,stroke.y);

  for (var i = 0; i < 2*fac*stroke.r; i++) {
    var ax = stroke.x + stroke.g[0]*(i-fac*stroke.r);
    var ay = stroke.y + stroke.g[1]*(i-fac*stroke.r);
    var r = stroke.r*brushStyle(i/(2*fac*stroke.r));

    paintCircle(canvas, blurImg, ax, ay, r, zval, zbuf, color);
  }
}

function renderSplineStroke(canvas, blurImg, stroke, zval, zbuf, A) {
  var color = stroke.color;
  var cPoints = stroke.cPoints;
  var r = stroke.r;
  if (cPoints.length == 0) {
    return
  } else if (cPoints.length == 1) {
    paintCircle(canvas, blurImg, cPoints[0].x, cPoints[0].y, r, zval, zbuf, color, A);
  } else if (cPoints.length == 2) {
    for (var i = 0; i < 1; i+=1/r) {
      var ax = cPoints[0].x * (1-i) + cPoints[1].x * i;
      var ay = cPoints[0].y * (1-i) + cPoints[1].y * i;
      paintCircle(canvas, blurImg, ax, ay, r, zval, zbuf, color, A);
    }
  } else if (cPoints.length == 3) {
    for (var j = 0; j < cPoints.length - 1; j++) {
      for (var i = 0; i < 1; i+=1/r) {
        var ax = cPoints[j].x * (1-i) + cPoints[j+1].x * i;
        var ay = cPoints[j].y * (1-i) + cPoints[j+1].y * i;
        paintCircle(canvas, blurImg, ax, ay, r, zval, zbuf, color, A);
      }
    }
  } else {
    var bspl = []
    for (var i = 0; i <= r; i++) { 
      var u = i/r;
      bspl.push([((1-u)*(1-u)*(1-u))/6, 
               (3*u*u*u - 6*u*u + 4)/6,
               (-3*u*u*u + 3*u*u + 3*u + 1)/6,
               (u*u*u)/6]);
    }
    for (var j = 0; j < cPoints.length - 3; j++) {
      for (var i = 0; i <= r; i++) {
        var ax = 0;
        var ay = 0;
        for (var z = 0; z < bspl[i].length; z++) {
          ax += cPoints[j + z].x * bspl[i][z];
          ay += cPoints[j + z].y * bspl[i][z];
        }
        paintCircle(canvas, blurImg, ax, ay, r, zval, zbuf, color, A);
      }
    }
  }
}

// paints the current layer (based on r) onto canvas
function paintLayer(canvas, blurImg, r, FC, A, FG, T, minL, maxL, jitter) {
  var circles = [];
  var strokes = [];
  var zvals = []
  var zbuf = negGrid(canvas.width, canvas.height);
  var difGrid = genDifGrid(canvas,blurImg);
  var grid = FG*r;
  var graGrid = genGraGrid(blurImg);
  for (var y = 0; y < blurImg.height; y+=grid) {
    for (var x = 0; x < blurImg.width; x+=grid) {
      var avgDif = avgDifference(canvas,difGrid,x,y,grid);
      if (avgDif[0] > T) {
        // var s = makeStroke(r, x, y, blurImg);
        var s = makeSplineStroke(r, x, y, canvas, blurImg, graGrid, minL, maxL, FC, jitter);
        strokes.push(s);
        zvals.push(Math.random());
      } 
    }
  }

  for (var i = 0; i < strokes.length; i++) {
    // renderStroke(canvas, blurImg, strokes[i], zvals[i], zbuf);
    renderSplineStroke(canvas, blurImg, strokes[i], zvals[i], zbuf, A);
  }
}

Filters.paintFilter = function( image, thresh, brushSizes, fc, fs, a, fg, minl, maxl, jh, js, jv, jr, jg, jb) {
  // constants
  var T = thresh;
  var FC = fc;
  var FS = fs;
  var A = a;
  var FG = fg;
  var minL = minl;
  var maxL = maxl;
  var jitter = [jh, js, jv, jr, jg, jb]

  // extract brush sizes from the URL string and sort them
  var brushes = [];
  var bSizes = brushSizes.split("x");
  for (var i = 0; i < bSizes.length; i++) {
    var b = parseInt(bSizes[i]);
    if (!isNaN(b)) {
      brushes.push(b);
    }
  }
  brushes.sort(sortDesc);

  // create the canvas 
  var canvas = image.createImg(image.width, image.height);
  canvas.fill(new Pixel(0,0,0,0));

  // for each brush size
  for (var i = 0; i < brushes.length; i++) {
    var r = brushes[i];
    // create the reference blur image
    var blurImg = Filters.gaussianFilter(image, brushes[i]*FS); 
    // paint layer
    paintLayer(canvas, blurImg, r, FC, A, FG, T, minL, maxL, jitter);
    if (i == 0) {
      for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
          if (canvas.getPixel(x,y).a == 0) {
            canvas.setPixel(x,y,blurImg.getPixel(x,y));
          }
        }
      }
    }
  }

  return canvas;
};

Filters.impressionFilter = function( image) {
  var brushes = "x8x4x2";
  var T = 20;
  var FC = 1;
  var FS = 0.5;
  var A = 1;
  var FG = 1;
  var minL = 4;
  var maxL = 16;
  var jh = 0;
  var js = 0;
  var jv = 0;
  var jr = 0;
  var jg = 0;
  var jb = 0;
  return Filters.paintFilter(image, T, brushes, FC, FS, A, FG, minL, maxL, 
    jh, js, jv, jr, jg, jb);
}

Filters.expressionFilter = function( image) {
  var brushes = "x8x4x2";
  var T = 25;
  var FC = 0.5;//0.3
  var FS = 0.5;
  var A = 0.5;//0.7
  var FG = 1;
  var minL = 10;
  var maxL = 16;
  var jh = 0;
  var js = 0;
  var jv = 0.3;//0.5
  var jr = 0;
  var jg = 0;
  var jb = 0;
  return Filters.paintFilter(image, T, brushes, FC, FS, A, FG, minL, maxL, 
    jh, js, jv, jr, jg, jb);
}

Filters.coloristFilter = function( image) {
  var brushes = "x8x4x2";
  var T = 60;
  var FC = 1;
  var FS = 0.5;
  var A = 0.5;
  var FG = 1;
  var minL = 4;
  var maxL = 16;
  var jh = 0;
  var js = 0;
  var jv = 0;
  var jr = 0.3;
  var jg = 0.3;
  var jb = 0.3;
  return Filters.paintFilter(image, T, brushes, FC, FS, A, FG, minL, maxL, 
    jh, js, jv, jr, jg, jb);
}

Filters.pointFilter = function( image) {
  var brushes = "x4x2";
  var T = 100;
  var FC = 1;
  var FS = 0.5;
  var A = 1;
  var FG = 0.5;
  var minL = 0;
  var maxL = 0;
  var jh = 0.15;
  var js = 0;
  var jv = 0.15;//1
  var jr = 0;
  var jg = 0;
  var jb = 0;
  return Filters.paintFilter(image, T, brushes, FC, FS, A, FG, minL, maxL, 
    jh, js, jv, jr, jg, jb);
}

Filters.watercolorFilter = function( image) {
  var brushes = "x8x4x2";
  var T = 25;
  var FC = 0.8;
  var FS = 0.7;
  var A = 0.1;
  var FG = 1;
  var minL = 4;
  var maxL = 10;
  var jh = 0.1;
  var js = 0;
  var jv = 0;
  var jr = 0;
  var jg = 0;
  var jb = 0;
  return Filters.paintFilter(image, T, brushes, FC, FS, A, FG, minL, maxL, 
    jh, js, jv, jr, jg, jb);
}

/******************************************************************************/
/******************************************************************************/
/*****************************END OF FINAL PROJECT*****************************/
/******************************************************************************/
/******************************************************************************/

// draw a line on the canvas starting at x,y, following the perpendicular of the
// gradient (essentially follow edges) until the edge intersects a previously
// drawn edge or the edge of the canvas. The line color is color.
function drawline(canvas, blurImg, x, y, color) {
  // define the x and y gradient detect masks (Sobel Kernels)
  var xMask = [[-1,-2,-1],[0,0,0],[1,2,1]];
  var yMask = [[1,0,-1],[2,0,-2],[1,0,-1]];
  var pixel = canvas.getPixel(x,y);
  // if pixel has not been colored yet
  if (pixel.data[0] == 1 && pixel.data[1] == 1 && pixel.data[2] == 1) {
    // set the current pixel color.
    canvas.setPixel(x,y,color);
    var gx = convomask(blurImg, x, y, 3, xMask);
    var gy = convomask(blurImg, x, y, 3, yMask);
    // set direction perpendicular to gradient direction
    var dir = 2; // horizontal
    if (gx == 0 && gy != 0) dir = 0; //vertical
    else if (gx != 0) {
      // get the direction of the gradient
      dir = Math.atan(gy/gx);
      if (dir < -3*pi/8 || dir >= 3*pi/8) dir = 0; // vertical
      else if (dir < -pi/8) dir = 1; // -45 degrees
      else if (dir < pi/8) dir = 2; // horizontal
      else dir = 3; // 45 degrees
    }
    // horizontal line
    if (dir == 0 && x < canvas.width-1) drawline(canvas, blurImg, x+1, y, color);
    // up to the right line
    else if (dir == 1 && x < canvas.width-1 && y > 0) drawline(canvas, blurImg, x+1, y-1, color);
    // vertical line
    else if (dir == 2 && y < canvas.height-1) drawline(canvas, blurImg, x, y+1, color);
    //down to the right line
    else if (dir == 3 && x < canvas.width-1 && y < canvas.height-1) drawline(canvas, blurImg, x+1, y+1, color);
  }
}

Filters.customFilter = function( image, value ) {
  var value = 0.5*value + 0.1;
  // create a blurred image
  var blurImg = Filters.gaussianFilter(image, 2);
  // create a canvas
  var canvas = image.createImg(image.width, image.height);
  // iterate over the canvas (column major order produced better result)
  for (var x = 0; x < canvas.width; x++) {
    for (var y = 0; y < canvas.height; y++) {
      // get the current pixel
      var pixel = canvas.getPixel(x,y);
      // if the pixel has not been colored yet
      if (pixel.data[0] == 1 && pixel.data[1] == 1 && pixel.data[2] == 1) {
        // pseudo-random value
        var temp = Math.sin(x+y); 
        // choose the "gray" color and then draw the line
        var graylum = temp*temp*value;
        var gray = new Pixel(graylum, graylum, graylum);
        drawline(canvas, blurImg, x, y, gray);
      }
    }
  }
  var negGray = new Pixel(value/2,value/2,value/2);
  // subtract negGray from each pixel and add the gray values from the canvas's
  // lines to the image. On avereage, 0 net change in luminance
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var gray = canvas.getPixel(x,y);
      var pixel = image.getPixel(x,y);
      var newpixel = pixel.minus(negGray).plus(gray);
      newpixel.clamp();
      image.setPixel(x,y,newpixel);
    }
  }
  // ----------- STUDENT CODE END ------------
  return image;
};

// calculate the gradient of an image
function calcGradient(img) {
  var xMask = [[-1,-2,-1],[0,0,0],[1,2,1]];
  var yMask = [[1,0,-1],[2,0,-2],[1,0,-1]];
  var grad = [];
  for (var x = 0; x < img.width; x++) {
    var yGrad = []
    for (var y = 0; y < img.height; y++) {
      var gx = convomask(img, x, y, 3, xMask);
      var gy = convomask(img, x, y, 3, yMask);
      yGrad.push([gx,gy]);
    }
    grad.push(yGrad);
  }
  return grad;
}

// paints a spattered circle of radius r at x,y on canvas based on blurImg
function paintCircle2(canvas, x, y, r, color) {
  var radiusSquare = r * r;
  for (var dy = -r+1; dy < r; dy++) {
    for (var dx = -r+1; dx < r; dx++) {
      if (Math.random()*(1-Math.sqrt(dx*dx+dy*dy)/r) > .05) {
        var nColor = color.multipliedBy(1-Math.sqrt(dx*dx+dy*dy)/r).plus(canvas.getPixel(x+dx,y+dy).multipliedBy(Math.sqrt(dx*dx+dy*dy)/r))
        canvas.setPixel(Math.round(x + dx), Math.round(y + dy), nColor);
      }
    }
  }
}

function sampleGrad(grad, x, y) {
  var cx = Math.ceil(x);
  var cy = Math.ceil(y);
  var fx = Math.floor(x);
  var fy = Math.floor(y);
  var rx = cx - x;
  var ry = cy - y;
  var q11 = grad[fx][fy];
  var q12 = grad[fx][cy];
  var q21 = grad[cx][fy];
  var q22 = grad[cx][cy];
  var a = [q11[0]*rx + q21[0]*(1-rx), q11[1]*rx + q21[1]*(1-rx)];
  var b = [q12[0]*rx + q22[0]*(1-rx), q12[1]*rx + q22[1]*(1-rx)];
  return [a[0]*ry + b[0]*(1-ry), a[1]*ry + b[1]*(1-ry)];
}

// draw a line on the canvas starting at x,y, following the perpendicular of the
// gradient (essentially follow edges) until the edge intersects a previously
// drawn edge or the edge of the canvas. The line color is color.
function drawCurve(canvas, grad, x, y, color) {
  var pixel = Filters.samplePixel(canvas,x,y,'bilinear');
  var dist = 4;
  // if pixel has not been colored yet
  if (x >= 0 && y >= 0 && x <= canvas.width-1 && y <= canvas.height-1 &&
      pixel.data[0] > 0.8 && pixel.data[1] > 0.8 && pixel.data[2] > 0.8) {
    // set the current pixel color.
    paintCircle2(canvas, x, y, dist, color);
    var sg = sampleGrad(grad, x, y);
    if (sg[0] == 0 && sg[1] == 0) return;
    var g = norm(sg[1],-sg[0]);
    if (g[0] < 0) g = [-g[0],-g[1]];

    drawCurve(canvas, grad, x+dist*g[0], y+dist*g[1], color);
  }
}

Filters.failedFilter = function( image, value ) {
  var value = 0.5*value + 0.1;
  // create a blurred image
  var blurImg = Filters.gaussianFilter(image, 2);
  // gradient of the blurred image
  var grad = calcGradient(blurImg);
  // create a canvas
  var canvas = image.createImg(image.width, image.height);
  // iterate over the canvas (column major order produced better result)
  for (var x = 0; x < canvas.width; x++) {
    for (var y = 0; y < canvas.height; y++) {
      // get the current pixel
      var pixel = canvas.getPixel(x,y);
      // if the pixel has not been colored yet
      if (pixel.data[0] == 1 && pixel.data[1] == 1 && pixel.data[2] == 1) {
        // pseudo-random value
        var temp = Math.sin(x+y); 
        // choose the "gray" color and then draw the line
        var graylum = temp*temp*value;
        var gray = new Pixel(graylum, graylum, graylum);
        drawCurve(canvas, grad, x, y, gray);
      }
    }
  }
  var gray = new Pixel(0.5, 0.5, 0.5);
  drawCurve(canvas, grad, 420, 280, gray);

  var negGray = new Pixel(value/2,value/2,value/2);
  // subtract negGray from each pixel and add the gray values from the canvas's
  // lines to the image. On avereage, 0 net change in luminance
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var gray = canvas.getPixel(x,y);
      var pixel = image.getPixel(x,y);
      var newpixel = pixel.minus(negGray).plus(gray);
      newpixel.clamp();
      image.setPixel(x,y,newpixel);
    }
  }

  return image;
}

