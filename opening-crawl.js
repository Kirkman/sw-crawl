load("sbbsdefs.js");
load("frame.js");


// Perspective-Transform.js
// https://github.com/jlouthan/perspective-transform
// -------------------------------------------------
// I'm including the code inline, because I can't seem to get
// Perspective-Transform.js to work when I try to call it
// with the load() command.
var numeric = {};

numeric.dim = function dim(x) {
	var y,z;
	if(typeof x === "object") {
		y = x[0];
		if(typeof y === "object") {
			z = y[0];
			if(typeof z === "object") {
				return numeric._dim(x);
			}
			return [x.length,y.length];
		}
		return [x.length];
	}
	return [];
};

numeric._foreach2 = (function _foreach2(x,s,k,f) {
	if(k === s.length-1) { return f(x); }
	var i,n=s[k], ret = Array(n);
	for(i=n-1;i>=0;i--) { ret[i] = _foreach2(x[i],s,k+1,f); }
	return ret;
});

numeric.cloneV = function (x) {
	var _n = x.length;
	var i, ret = Array(_n);

	for(i=_n-1;i!==-1;--i) {
		ret[i] = (x[i]);
	}
	return ret;
};

numeric.clone = function (x) {
	if(typeof x !== "object") return (x);
	var V = numeric.cloneV;
	var s = numeric.dim(x);
	return numeric._foreach2(x,s,0,V);
};

numeric.diag = function diag(d) {
	var i,i1,j,n = d.length, A = Array(n), Ai;
	for(i=n-1;i>=0;i--) {
		Ai = Array(n);
		i1 = i+2;
		for(j=n-1;j>=i1;j-=2) {
			Ai[j] = 0;
			Ai[j-1] = 0;
		}
		if(j>i) { Ai[j] = 0; }
		Ai[i] = d[i];
		for(j=i-1;j>=1;j-=2) {
			Ai[j] = 0;
			Ai[j-1] = 0;
		}
		if(j===0) { Ai[0] = 0; }
		A[i] = Ai;
	}
	return A;
};

numeric.rep = function rep(s,v,k) {
	if(typeof k === "undefined") { k=0; }
	var n = s[k], ret = Array(n), i;
	if(k === s.length-1) {
		for(i=n-2;i>=0;i-=2) { ret[i+1] = v; ret[i] = v; }
		if(i===-1) { ret[0] = v; }
		return ret;
	}
	for(i=n-1;i>=0;i--) { ret[i] = numeric.rep(s,v,k+1); }
	return ret;
};

numeric.identity = function(n) { return numeric.diag(numeric.rep([n],1)); };

numeric.inv = function inv(a) {
	var s = numeric.dim(a), abs = Math.abs, m = s[0], n = s[1];
	var A = numeric.clone(a), Ai, Aj;
	var I = numeric.identity(m), Ii, Ij;
	var i,j,k,x;
	for(j=0;j<n;++j) {
		var i0 = -1;
		var v0 = -1;
		for(i=j;i!==m;++i) { k = abs(A[i][j]); if(k>v0) { i0 = i; v0 = k; } }
		Aj = A[i0]; A[i0] = A[j]; A[j] = Aj;
		Ij = I[i0]; I[i0] = I[j]; I[j] = Ij;
		x = Aj[j];
		for(k=j;k!==n;++k)    Aj[k] /= x; 
		for(k=n-1;k!==-1;--k) Ij[k] /= x;
		for(i=m-1;i!==-1;--i) {
			if(i!==j) {
				Ai = A[i];
				Ii = I[i];
				x = Ai[j];
				for(k=j+1;k!==n;++k)  Ai[k] -= Aj[k]*x;
				for(k=n-1;k>0;--k) { Ii[k] -= Ij[k]*x; --k; Ii[k] -= Ij[k]*x; }
				if(k===0) Ii[0] -= Ij[0]*x;
			}
		}
	}
	return I;
};

numeric.dotMMsmall = function dotMMsmall(x,y) {
	var i,j,k,p,q,r,ret,foo,bar,woo,i0;
	p = x.length; q = y.length; r = y[0].length;
	ret = Array(p);
	for(i=p-1;i>=0;i--) {
		foo = Array(r);
		bar = x[i];
		for(k=r-1;k>=0;k--) {
			woo = bar[q-1]*y[q-1][k];
			for(j=q-2;j>=1;j-=2) {
				i0 = j-1;
				woo += bar[j]*y[j][k] + bar[i0]*y[i0][k];
			}
			if(j===0) { woo += bar[0]*y[0][k]; }
			foo[k] = woo;
		}
		ret[i] = foo;
	}
	return ret;
};

numeric.dotMV = function dotMV(x,y) {
	var p = x.length, i;
	var ret = Array(p), dotVV = numeric.dotVV;
	for(i=p-1;i>=0;i--) { ret[i] = dotVV(x[i],y); }
	return ret;
};

numeric.dotVV = function dotVV(x,y) {
	var i,n=x.length,i1,ret = x[n-1]*y[n-1];
	for(i=n-2;i>=1;i-=2) {
		i1 = i-1;
		ret += x[i]*y[i] + x[i1]*y[i1];
	}
	if(i===0) { ret += x[0]*y[0]; }
	return ret;
};

numeric.transpose = function transpose(x) {
	var i,j,m = x.length,n = x[0].length, ret=Array(n),A0,A1,Bj;
	for(j=0;j<n;j++) ret[j] = Array(m);
	for(i=m-1;i>=1;i-=2) {
		A1 = x[i];
		A0 = x[i-1];
		for(j=n-1;j>=1;--j) {
			Bj = ret[j]; Bj[i] = A1[j]; Bj[i-1] = A0[j];
			--j;
			Bj = ret[j]; Bj[i] = A1[j]; Bj[i-1] = A0[j];
		}
		if(j===0) {
			Bj = ret[0]; Bj[i] = A1[0]; Bj[i-1] = A0[0];
		}
	}
	if(i===0) {
		A0 = x[0];
		for(j=n-1;j>=1;--j) {
			ret[j][0] = A0[j];
			--j;
			ret[j][0] = A0[j];
		}
		if(j===0) { ret[0][0] = A0[0]; }
	}
	return ret;
};




function round(num){
	return Math.round(num*10000000000)/10000000000;
}

function getNormalizationCoefficients(srcPts, dstPts, isInverse){
	if(isInverse){
		var tmp = dstPts;
		dstPts = srcPts;
		srcPts = tmp;
	}
	var r1 = [srcPts[0], srcPts[1], 1, 0, 0, 0, -1*dstPts[0]*srcPts[0], -1*dstPts[0]*srcPts[1]];
	var r2 = [0, 0, 0, srcPts[0], srcPts[1], 1, -1*dstPts[1]*srcPts[0], -1*dstPts[1]*srcPts[1]];
	var r3 = [srcPts[2], srcPts[3], 1, 0, 0, 0, -1*dstPts[2]*srcPts[2], -1*dstPts[2]*srcPts[3]];
	var r4 = [0, 0, 0, srcPts[2], srcPts[3], 1, -1*dstPts[3]*srcPts[2], -1*dstPts[3]*srcPts[3]];
	var r5 = [srcPts[4], srcPts[5], 1, 0, 0, 0, -1*dstPts[4]*srcPts[4], -1*dstPts[4]*srcPts[5]];
	var r6 = [0, 0, 0, srcPts[4], srcPts[5], 1, -1*dstPts[5]*srcPts[4], -1*dstPts[5]*srcPts[5]];
	var r7 = [srcPts[6], srcPts[7], 1, 0, 0, 0, -1*dstPts[6]*srcPts[6], -1*dstPts[6]*srcPts[7]];
	var r8 = [0, 0, 0, srcPts[6], srcPts[7], 1, -1*dstPts[7]*srcPts[6], -1*dstPts[7]*srcPts[7]];

	var matA = [r1, r2, r3, r4, r5, r6, r7, r8];
	var matB = dstPts;
	var matC;

	try{
		matC = numeric.inv(numeric.dotMMsmall(numeric.transpose(matA), matA));
	}catch(e){
		console.log(e);
		return [1,0,0,0,1,0,0,0];
	}

	var matD = numeric.dotMMsmall(matC, numeric.transpose(matA));
	var matX = numeric.dotMV(matD, matB);
	for(var i = 0; i < matX.length; i++) {
		matX[i] = round(matX[i]);
	}
	matX[8] = 1;

	return matX;
}

function PerspT(srcPts, dstPts){
	if( (typeof window !== 'undefined' && window === this) || this === undefined) {
		return new PerspT(srcPts, dstPts);
	}

	this.srcPts = srcPts;
	this.dstPts = dstPts;
	this.coeffs = getNormalizationCoefficients(this.srcPts, this.dstPts, false);
	this.coeffsInv = getNormalizationCoefficients(this.srcPts, this.dstPts, true);

	return this;
}

PerspT.prototype = {
	transform: function(x,y) {
		var coordinates = [];
		coordinates[0] = (this.coeffs[0]*x + this.coeffs[1]*y + this.coeffs[2]) / (this.coeffs[6]*x + this.coeffs[7]*y + 1);
		coordinates[1] = (this.coeffs[3]*x + this.coeffs[4]*y + this.coeffs[5]) / (this.coeffs[6]*x + this.coeffs[7]*y + 1);
		return coordinates;
	},

	transformInverse: function(x,y) {
		var coordinates = [];
		coordinates[0] = (this.coeffsInv[0]*x + this.coeffsInv[1]*y + this.coeffsInv[2]) / (this.coeffsInv[6]*x + this.coeffsInv[7]*y + 1);
		coordinates[1] = (this.coeffsInv[3]*x + this.coeffsInv[4]*y + this.coeffsInv[5]) / (this.coeffsInv[6]*x + this.coeffsInv[7]*y + 1);
		return coordinates;
	}
};
// END Perspective-Transform.js
// -------------------------------------------------







// Compare a canvas frame against data in another frame. Repaint characters that are different.
function repaintCanvas( newFrame, canvas ) {
	var newFrameData = newFrame.dump();
	for (var x=0; x<canvas.width; x++) {
		for (var y=0; y<canvas.height; y++) {
			var newChar = newFrameData[y][x];
			var oldChar = canvas.getData(x,y);
			// Compare corresponding characters on current canvas and the new frame.
			// If they are different, repaint the character on the canvas.
			if ( newChar && (newChar.attr !== oldChar.attr || newChar.ch !== oldChar.ch) ) {
				canvas.clearData(x,y);
				canvas.setData(x,y,newChar.ch,newChar.attr);
			}
			// If the new frame has a null instead of a character object,
			// treat that like an empty black space. Draw it on the canvas
			// if the corresponding character is not also an empty black space.
			else if ( newChar == null ) {
				if ( oldChar.ch != ascii(32) || oldChar.attr != BG_BLACK ) {
					canvas.clearData(x,y);
					canvas.setData(x,y,ascii(32),BG_BLACK);
				}
			}
		}
	}
}




var bgFrame, fgFrame, canvasFrame;

// Parent frame for all the background frames and sprite frames
bgFrame = new Frame(1, 1, 80, 24, BG_BLACK);
bgFrame.load(js.exec_dir + '/graphics/starfield.bin');
bgFrame.open();
//bgFrame.draw();

fgFrame  = new Frame(1, 1, 80, 24, undefined, bgFrame);
fgFrame.transparent = true;
fgFrame.open();
//fgFrame.draw();

// The Canvas frame will sit atop all the others. We will manually paint this frame with the data
// from bgFrame.dump(). Using a canvas with manual repaint is faster than plain bgFrame.cycle();
canvasFrame = new Frame(1, 1, 80, 24, BG_BLACK);
canvasFrame.transparent = false;
canvasFrame.draw();



function getJson( filename ) {
	var f = new File( filename );
	f.open('r');
	var json = f.read();
	// Strip out my comments so it's valid JSON
	json = json.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm,'');
	var obj = JSON.parse( json );
	f.close();
	if (obj) {
		return obj;
	}
	else {
		return false;
	}
}



function drawLogo(image) {


	// CREATE PERSPECTIVE TRANSFORM
	// source corners:
	var sx1 = 0, sy1 = 0;
	var sx2 = 159; sy2 = 99;

	var cornersSrc = [sx1,sy1,sx2,sy1,sx1,sy2,sx2,sy2];

	// SHRINK THE IMAGE

	for ( r=-10; r < 24; r++ ) {
		// Coordinates for destination screen
		var dx1 = 0, dy1 = 0;
		var dx2 = 79; dy2 = 49;

		// One way to do shrink the rectangle would be to move
		// the corners one unit each frame. But  that would
		// actually distort the shape of the rectangle.
		// Instead, let's factor in the aspect ratio (1.6:1 or 80:50)
		// when calculating how much to resize.
		var xr = Math.round( 1.6 * r );
		var yr = Math.round( 1 * r );

		// Destination corners (resized)
		var cornersDest = [
			dx1+xr, dy1+yr,
			dx2-xr, dy1+yr,
			dx1+xr, dy2-yr,
			dx2-xr, dy2-yr
		];

		var perspT = new PerspT(cornersSrc, cornersDest);

		var gotkey = false;
		var key = console.inkey( K_UPPER );
// 		var key = console.getkey( K_UPPER );
		if ( key ) {
			// Exit handler: Q, X, [esc]
			if ( key == 'Q' || key == 'X' || ascii(key) == 27 ) {
				fgFrame.delete();
				exit();
			}
			else {
				//
			}
		}



		// CONVERT THE DATA, THEN DRAW ONTO DESTINATION CANVAS

		// Iterate over every virtual "pixel"
		for (var destX=0; destX<80; destX++) {
			for (var destY=0; destY<50; destY+=2) {

				// One "pixel" is actually half a screen character.
				// So we need the TWO pixels that are vertically adjacent.
				var srcPixel = [];
				for (var s=0; s<2; s++) {
					var srcCoord = perspT.transformInverse( destX, destY + s);
					var srcX = Math.round(srcCoord[0]);
					var srcY = Math.round(srcCoord[1]);

					// If the source pixel is on-canvas, then get its color value.
					if ( srcX > -1 && srcY > -1 && srcX < 161 && srcY < 99 ) {
						try {
						srcPixel[s] = image[srcY][srcX];
						}
						catch(err) {
							//debug( 'r: ' + r + ' | s:' + s + ' | srcX: ' + srcX + ' | srcY: ' + srcY);
						}
					}
					// If the source pixel is off-canvas, set color to 0 (black)
					else {
						srcPixel[s] = 0;
					}
				}

				// We now have two vertically adjacent pixels. 
				// If both are the same color, we'll output a solid block character.
				// If they are different, we need to output a half-block character
				// with different foreground and background colors.
				
				// SOLID BLOCKS
				// 0 = black
				if (srcPixel[0] == 0 && srcPixel[1] == 0) {
					fgFrame.clearData(destX,destY/2);
					// We want the background starfield layer to show through,
					// so set to undefined rather than black.
					fgFrame.setData(destX,destY/2,undefined,undefined);
				}
				// 1 = brown
				else if (srcPixel[0] == 1 && srcPixel[1] == 1) {
					fgFrame.clearData(destX,destY/2);
					fgFrame.setData(destX,destY/2,ascii(32),YELLOW|BG_BROWN);
				}
				// 2 = yellow
				else if (srcPixel[0] == 2 && srcPixel[1] == 2) {
					fgFrame.clearData(destX,destY);
					fgFrame.setData(destX,destY/2,ascii(219),YELLOW|BG_BROWN);
				}

				// HALF BLOCK COMBINATIONS
				// top yellow, bottom brown
				else if (srcPixel[0] == 2 && srcPixel[1] == 1) {
					fgFrame.clearData(destX,destY);
					fgFrame.setData(destX,destY/2,ascii(223),YELLOW|BG_BROWN);
				}
				// top brown, bottom yellow
				else if (srcPixel[0] == 1 && srcPixel[1] == 2) {
					fgFrame.clearData(destX,destY);
					fgFrame.setData(destX,destY/2,ascii(220),YELLOW|BG_BROWN);
				}
				// top yellow, bottom black
				else if (srcPixel[0] == 2 && srcPixel[1] == 0) {
					fgFrame.clearData(destX,destY);
					fgFrame.setData(destX,destY/2,ascii(223),YELLOW|BG_BLACK);
				}
				// top black, bottom yellow
				else if (srcPixel[0] == 0 && srcPixel[1] == 2) {
					fgFrame.clearData(destX,destY);
					fgFrame.setData(destX,destY/2,ascii(220),YELLOW|BG_BLACK);
				}
				// top brown, bottom black
				else if (srcPixel[0] == 1 && srcPixel[1] == 0) {
					fgFrame.clearData(destX,destY);
					fgFrame.setData(destX,destY/2,ascii(223),BROWN|BG_BLACK);
				}
				// top black, bottom brown
				else if (srcPixel[0] == 0 && srcPixel[1] == 1) {
					fgFrame.clearData(destX,destY);
					fgFrame.setData(destX,destY/2,ascii(220),BROWN|BG_BLACK);
				}
			}
		}

		//bgFrame.cycle();
		repaintCanvas( bgFrame, canvasFrame );
		canvasFrame.cycle();

		//bgFrame.screenShot(js.exec_dir + "/screenshots/debug-1logo-" + (r+10) + ".bin", false);
		mswait(20);
	}
}






function drawCrawl(image) {
	// CREATE PERSPECTIVE TRANSFORM
	// source corners:
	// 0,0
	// 80,0
	// 0,50
	// 80,50
	var cornersSrc = [0,0,79,0,0,49,79,49];

	// destination corners
	// 24,2
	// 56,2
	// -5,54
	// 85,54
	var cornersDest = [26,6,53,6,0,50,80,50];

	var perspT = new PerspT(cornersSrc, cornersDest);


	// SCROLL THE IMAGE
	var imgHeight = image.length;

	for ( r=0; r < imgHeight-50; r++ ) {
		var gotkey = false;
		var key = console.inkey( K_UPPER );
// 		var key = console.getkey( K_UPPER );
		if ( key ) {
			// Exit handler: Q, X, [esc]
			if ( key == 'Q' || key == 'X' || ascii(key) == 27 ) {
				fgFrame.delete();
				exit();
			}
			else {
				//
			}
		}


		fgFrame.clear();

		// CONVERT THE DATA, THEN DRAW ONTO DESTINATION CANVAS

		// Iterate over every virtual "pixel"
		for (var destX=0; destX<80; destX++) {
			for (var destY=0; destY<50; destY+=2) {

				// One "pixel" is actually half a screen character.
				// So we need the TWO pixels that are vertically adjacent.
				var srcPixel = [];
				for (var s=0; s<2; s++) {
					var srcCoord = perspT.transformInverse( destX, destY + s);
					var srcX = Math.round(srcCoord[0]);
					var srcY = Math.round(srcCoord[1]);

					// If the source pixel is on-canvas, then get its color value.
					if ( srcX > -1 && srcY > -1 && srcX < 81 && srcY < 51 ) {
						srcPixel[s] = image[srcY+r][srcX];
					}
					// If the source pixel is off-canvas, set color to 0 (black)
					else {
						srcPixel[s] = 0;
					}

					// OPTIONAL
					// Make the top lines darker, like it's fading out
					//if ( srcPixel[s] > 0 && destY < 16 ) {
					//	srcPixel[s] = 1;
					//}
				}



				// We now have two vertically adjacent pixels. 
				// If both are the same color, we'll output a solid block character.
				// If they are different, we need to output a half-block character
				// with different foreground and background colors.

				// SOLID BLOCKS
				// 0 = black
				if (srcPixel[0] == 0 && srcPixel[1] == 0) {
					fgFrame.clearData(destX,destY/2);
					// We want the background starfield layer to show through,
					// so set to undefined rather than black.
					fgFrame.setData(destX,destY/2,undefined,undefined);
				}
				// 1 = brown
				else if (srcPixel[0] == 1 && srcPixel[1] == 1) {
					fgFrame.clearData(destX,destY/2);
					fgFrame.setData(destX,destY/2,ascii(32),YELLOW|BG_BROWN);
				}
				// 2 = yellow
				else if (srcPixel[0] == 2 && srcPixel[1] == 2) {
					fgFrame.clearData(destX,destY);
					fgFrame.setData(destX,destY/2,ascii(219),YELLOW|BG_BROWN);
				}

				// HALF BLOCK COMBINATIONS
				// top yellow, bottom brown
				else if (srcPixel[0] == 2 && srcPixel[1] == 1) {
					fgFrame.clearData(destX,destY);
					fgFrame.setData(destX,destY/2,ascii(223),YELLOW|BG_BROWN);
				}
				// top brown, bottom yellow
				else if (srcPixel[0] == 1 && srcPixel[1] == 2) {
					fgFrame.clearData(destX,destY);
					fgFrame.setData(destX,destY/2,ascii(220),YELLOW|BG_BROWN);
				}
				// top yellow, bottom black
				else if (srcPixel[0] == 2 && srcPixel[1] == 0) {
					fgFrame.clearData(destX,destY);
					fgFrame.setData(destX,destY/2,ascii(223),YELLOW|BG_BLACK);
				}
				// top black, bottom yellow
				else if (srcPixel[0] == 0 && srcPixel[1] == 2) {
					fgFrame.clearData(destX,destY);
					fgFrame.setData(destX,destY/2,ascii(220),YELLOW|BG_BLACK);
				}
				// top brown, bottom black
				else if (srcPixel[0] == 1 && srcPixel[1] == 0) {
					fgFrame.clearData(destX,destY);
					fgFrame.setData(destX,destY/2,ascii(223),BROWN|BG_BLACK);
				}
				// top black, bottom brown
				else if (srcPixel[0] == 0 && srcPixel[1] == 1) {
					fgFrame.clearData(destX,destY);
					fgFrame.setData(destX,destY/2,ascii(220),BROWN|BG_BLACK);
				}
			}
		}

		bgFrame.cycle();
		// bgFrame.screenShot(js.exec_dir + "/screenshots/sw-crawl-" + r + ".bin", false);
		mswait(20);
	}
}

var logo = getJson( js.exec_dir + 'json/star-wars-logo.json' );
//var logo = getJson( js.exec_dir + 'json/star-trek-logo.json' );
drawLogo( logo['data'] );


//var crawl = getJson( js.exec_dir + 'json/star-trek-crawl.json' );
//var crawl = getJson( js.exec_dir + 'json/opening-crawl-single.json' );
// var crawl = getJson( js.exec_dir + 'json/opening-crawl.json' );
var crawl = getJson( js.exec_dir + 'json/info-crawl.json' );

drawCrawl( crawl['data'] );


bgFrame.delete();
exit();