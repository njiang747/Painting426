  "use strict";

var Filters = Filters || {};

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
  var coords = {x: ax, y: ay}
  for (var y = ly; y <= uy; y++) {
    for (var x = lx; x <= ux; x++) {
      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        if (difGrid[x][y] > dMax) {
          dMax = difGrid[x][y];
          coords = {x: x, y: y}
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

// paints a colored circle of radius r at x,y on canvas based
function paintCircle(canvas, blurImg, x, y, r, zval, zbuf, color, A) {
  var aColor = color.multipliedBy(A);
  if (x < 0 || y < 0 || x > canvas.width - 1 || y > canvas.height - 1) return;
  var radiusSquare = r * r;
  for (var dy = -r+1; dy < r; dy++) {
    for (var dx = -r+1; dx < r; dx++) {
      var ax = Math.floor(x + dx);
      var ay = Math.floor(y + dy);
      var cVal = 1-Math.sqrt(dx*dx+dy*dy)/r; // 1 at center, 0 at edge
      if (ax >= 0 && ay >= 0 && ax < canvas.width && ay < canvas.height && 
          zval > zbuf[ax][ay] && cVal > 0) {
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

// paints a stroke 
function paintStroke(canvas, blurImg, x, y, r, zval, zbuf, color, A, g) {
  var aColor = color.multipliedBy(A);
  if (x < 0 || y < 0 || x > canvas.width - 1 || y > canvas.height - 1) return;
  var radiusSquare = r * r;
  for (var i = -r+1; i < r; i++) {
    var dx = g.x*i;
    var dy = g.y*i;
    var ax = Math.floor(x + dx);
    var ay = Math.floor(y + dy);
    paintCircle(canvas, blurImg, ax, ay, r/2, zval, zbuf, new Pixel(0,0,0), A);

    if (ax >= 0 && ay >= 0 && ax < canvas.width && ay < canvas.height && 
        zval >= zbuf[ax][ay]) {
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

function renderSplineStroke(canvas, blurImg, stroke, zval, zbuf, A, bspl) {
  var color = stroke.color;
  var cPoints = stroke.cPoints;
  var r = stroke.r;
  if (cPoints.length == 0) {
    return
  } else if (cPoints.length == 1) {
    paintCircle(canvas, blurImg, cPoints[0].x, cPoints[0].y, r, zval, zbuf, color, A);
    // var g = norm(0,0);
    // paintStroke(canvas, blurImg, cPoints[0].x, cPoints[0].y, r, zval, zbuf, color, A, g);
  } else if (cPoints.length == 2) {
    for (var i = 0; i < 1; i+=1/r) {
      var ax = cPoints[0].x * (1-i) + cPoints[1].x * i;
      var ay = cPoints[0].y * (1-i) + cPoints[1].y * i;
      paintCircle(canvas, blurImg, ax, ay, r, zval, zbuf, color, A);
      // var dx = cPoints[1].x - cPoints[0].x;
      // var dy = cPoints[1].y - cPoints[0].y;
      // var g = norm(dx,dy);
      // paintStroke(canvas, blurImg, ax, ay, r, zval, zbuf, color, A, g);
    }
  } else if (cPoints.length == 3) {
    for (var j = 0; j < cPoints.length - 1; j++) {
      for (var i = 0; i < 1; i+=1/r) {
        var ax = cPoints[j].x * (1-i) + cPoints[j+1].x * i;
        var ay = cPoints[j].y * (1-i) + cPoints[j+1].y * i;
        paintCircle(canvas, blurImg, ax, ay, r, zval, zbuf, color, A);
        // var dx = cPoints[j+1].x - cPoints[j].x;
        // var dy = cPoints[j+1].y - cPoints[j].y;
        // var g = norm(dx,dy);
        // paintStroke(canvas, blurImg, ax, ay, r, zval, zbuf, color, A, g);
      }
    }
  } else {
    for (var j = 0; j < cPoints.length - 3; j++) {
      for (var i = 0; i <= r; i++) {
        var ax = 0;
        var ay = 0;
        for (var z = 0; z < bspl[0][i].length; z++) {
          ax += cPoints[j + z].x * bspl[0][i][z];
          ay += cPoints[j + z].y * bspl[0][i][z];
        }
        paintCircle(canvas, blurImg, ax, ay, r, zval, zbuf, color, A);
        // var dx = 0;
        // var dy = 0;
        // for (var z = 0; z < bspl[0][i].length; z++) {
        //   dx += cPoints[j + z].x * bspl[1][i][z];
        //   dy += cPoints[j + z].y * bspl[1][i][z];
        // }
        // var g = norm(dx,dy);
        // paintStroke(canvas, blurImg, ax, ay, r, zval, zbuf, color, A, g);
      }
    }
  }
}

// paints the current layer (based on r) onto canvas
function paintLayer(canvas, blurImg, r, FC, A, FG, T, minL, maxL, jitter, bspl, animation) {
  var start = new Date().getTime()/1000;

  var circles = [];
  var strokes = [];
  var zvals = []
  var zbuf = negGrid(canvas.width, canvas.height);
  var difGrid = genDifGrid(canvas,blurImg);
  var grid = FG*r;
  var graGrid = genGraGrid(blurImg);

  var current = new Date().getTime()/1000;
  console.log(" - Layer Setup: %s seconds", (current - start).toFixed(2));
  start = current;

  for (var y = 0; y <= blurImg.height-1; y+=grid) {
    for (var x = 0; x <= blurImg.width-1; x+=grid) {
      var avgDif = avgDifference(canvas,difGrid,x,y,grid);
      if (avgDif[0] > T) {
        // var s = makeStroke(r, x, y, blurImg);
        var s = makeSplineStroke(r, x, y, canvas, blurImg, graGrid, minL, maxL, FC, jitter);
        strokes.push(s);
        zvals.push(Math.random());
      } 
    }
  }

  var current = new Date().getTime()/1000;
  console.log(" - Make Strokes: %s seconds", (current - start).toFixed(2));
  start = current;

  if (animation) {
    // var test = r < 16;
    // if (test) shuffle(strokes); // Comment out for top to bottom
    var whiteCol = new Pixel(1,1,1);
    var frames = 16;
    var cap = Math.floor(strokes.length/frames);
    // var denominator = 
    //   test ? [128, 128, 64, 64, 64, 16, 8, 8, 8, 8, 8, 8, 8] : [24, 24, 24, 8, 8, 8, 8, 8, 8, 8];
    // var cap_2 = [];
    // for (var i = 0; i < denominator.length; i++) {
    //   cap_2.push(Math.floor(strokes.length/denominator[i]));
    // }
    var frameCounter = 0;
    var counter = 0;
    for (var i = 0; i < strokes.length; i++) {
      counter++;
      // renderStroke(canvas, blurImg, strokes[i], zvals[i], zbuf);
      renderSplineStroke(canvas, blurImg, strokes[i], zvals[i], zbuf, A, bspl);

      // if ((test && counter >= cap_2[frameCounter]) || (!test && counter >= cap)) {
      if (counter >= cap) {
        counter = 0;
        var temp = canvas.copyImg();
        for (var x = 0; x < temp.width; x++) {
          for (var y = 0; y < temp.height; y++) {
            if (temp.getPixel(x,y).a == 0)
              temp.setPixel(x,y,whiteCol);
          }
        }
        frameCounter++;
        Main.displayImage(temp,0,0,false);
        Main.gifEncoder.addFrame( Main.canvas.getContext( '2d' ) );
        if (frameCounter == frames) {
          for (var a = 0; a < 6; a++) {
            Main.gifEncoder.addFrame( Main.canvas.getContext( '2d' ) );
          }
        }
      }
    }
  } else {
    for (var i = 0; i < strokes.length; i++) {
      renderSplineStroke(canvas, blurImg, strokes[i], zvals[i], zbuf, A, bspl);
    }
  }

  var current = new Date().getTime()/1000;
  console.log(" - Render Strokes: %s seconds", (current - start).toFixed(2));
  start = current;
}

Filters.paintFilter = function( image, thresh, brushSizes, fc, fs, a, fg, minl, maxl, jh, js, jv, jr, jg, jb) {
  var start = new Date().getTime()/1000;
  var animation = (document.getElementById( 'anim_div' ) != undefined);
  console.log("Animated: " + animation);

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
  for (var a = 0; a < 6; a++) {
    Main.displayImage(canvas,0,0,false);
    Main.gifEncoder.addFrame( Main.canvas.getContext( '2d' ) );
  }
  canvas.fill(new Pixel(0,0,0,0));


  // for each brush size
  for (var i = 0; i < brushes.length; i++) {
    var r = brushes[i];

    // calculate the b-spline weights
    var bspl = []
    bspl.push([])
    for (var j = 0; j <= r; j++) { 
      var u = j/r;
      bspl[0].push([((1-u)*(1-u)*(1-u))/6, 
               (3*u*u*u - 6*u*u + 4)/6,
               (-3*u*u*u + 3*u*u + 3*u + 1)/6,
               (u*u*u)/6]);
      // bspl[1].push([(-(u-1)*(u-1))/2, 
      //          (3*u*u - 4*u)/2,
      //          (-3*u*u + 2*u + 1)/2,
      //          (u*u)/2]);
    }

    var start2 = new Date().getTime()/1000;
    console.log (" - Blur size %s", (brushes[i]*FS).toFixed(2))

    // create the reference blur image
    var blurImg = Filters.gaussianFilter(image, brushes[i]*FS); 

    var current2 = new Date().getTime()/1000;
    console.log(" - Gaussian Blur: %s seconds", (current2 - start2).toFixed(2));
    start2 = current2;

    // paint layer
    paintLayer(canvas, blurImg, r, FC, A, FG, T, minL, maxL, jitter, bspl, animation);
    if (i == 0) {
      for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
          if (canvas.getPixel(x,y).a == 0) {
            canvas.setPixel(x,y,blurImg.getPixel(x,y));
          }
        }
      }
    }
    var current = new Date().getTime()/1000;
    console.log(" - Total: %s seconds", (current - start).toFixed(2));
    start = current;
  }

  if (animation) {
    for (var a = 0; a < 12; a++) {
      Main.gifEncoder.addFrame( Main.canvas.getContext( '2d' ) );
    }
    Main.gifEncoder.finish();
    var binaryGif = Main.gifEncoder.stream().getData();
    var urlGif = 'data:image/gif;base64,' + encode64( binaryGif );
    var resGif = document.createElement( 'img' );
    resGif.src = urlGif;

    document.getElementById( 'anim_div' ).style.display = "none";

    var container = document.getElementById( 'result_div' );
    container.appendChild( resGif );
  }

  return canvas;
};

// convert a canvas to an image
// Code found at https://davidwalsh.name/convert-canvas-image
function canvasToImage(canvas) {  
  var image = new Image();
  image.src = canvas.toDataURL("image/png");
  return image;
}

Filters.impressionFilterHD = function( image) {
  var brushes = "x16x8x4";
  var T = 25;
  var FC = 1;
  var FS = 0.5;
  var A = 1;
  var FG = 0.8;
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

Filters.impressionFilter = function( image) {
  var brushes = "x8x4x2";
  var T = 25;
  var FC = 1;
  var FS = 0.5;
  var A = 1;
  var FG = 0.8;
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
  var jv = 0.4;//0.5
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

Filters.psychFilter = function( image) {
  var brushes = "x12x6x3";
  var T = 80;
  var FC = 0.3;
  var FS = 0.5;
  var A = 0.5;
  var FG = 1;
  var minL = 10;
  var maxL = 16;
  var jh = 0.8;
  var js = 0.25;
  var jv = 0;
  var jr = 0;
  var jg = 0;
  var jb = 0;
  return Filters.paintFilter(image, T, brushes, FC, FS, A, FG, minL, maxL, 
    jh, js, jv, jr, jg, jb);
}