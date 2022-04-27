/*Code for generating perlin noise
Credit: https://github.com/josephg/noisejs
*/
(function(global) {
	var module = global.noise = {};

	function Grad(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	Grad.prototype.dot2 = function(x, y) {
		return this.x * x + this.y * y;
	};

	Grad.prototype.dot3 = function(x, y, z) {
		return this.x * x + this.y * y + this.z * z;
	};

	var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
               new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
               new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];

	var p = [151, 160, 137, 91, 90, 15,
  131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
  190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
  88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
  77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
  102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
  135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
  5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
  223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
  129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
  251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
  49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
  138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

	var perm = new Array(512);
	var gradP = new Array(512);

	module.seed = function(seed) {
		if (seed > 0 && seed < 1) {
			seed *= 65536;
		}
		seed = Math.floor(seed);
		if (seed < 256) {
			seed |= seed << 8;
		}
		for (var i = 0; i < 256; i++) {
			var v;
			if (i & 1) {
				v = p[i] ^ (seed & 255);
			} else {
				v = p[i] ^ ((seed >> 8) & 255);
			}
			perm[i] = perm[i + 256] = v;
			gradP[i] = gradP[i + 256] = grad3[v % 12];
		}
	};
	module.seed(0);

	// Skewing and unskewing factors for 2, 3, and 4 dimensions
	var F2 = 0.5 * (Math.sqrt(3) - 1);
	var G2 = (3 - Math.sqrt(3)) / 6;

	var F3 = 1 / 3;
	var G3 = 1 / 6;

	// 2D simplex noise
	module.simplex2 = function(xin, yin) {
		var n0, n1, n2;
		var s = (xin + yin) * F2;
		var i = Math.floor(xin + s);
		var j = Math.floor(yin + s);
		var t = (i + j) * G2;
		var x0 = xin - i + t;
		var y0 = yin - j + t;
		var i1, j1;
		if (x0 > y0) {
			i1 = 1;
			j1 = 0;
		} else {
			i1 = 0;
			j1 = 1;
		}
		var x1 = x0 - i1 + G2; 
		var y1 = y0 - j1 + G2;
		var x2 = x0 - 1 + 2 * G2;
		var y2 = y0 - 1 + 2 * G2;
		i &= 255;
		j &= 255;
		var gi0 = gradP[i + perm[j]];
		var gi1 = gradP[i + i1 + perm[j + j1]];
		var gi2 = gradP[i + 1 + perm[j + 1]];
		var t0 = 0.5 - x0 * x0 - y0 * y0;
		if (t0 < 0) {
			n0 = 0;
		} else {
			t0 *= t0;
			n0 = t0 * t0 * gi0.dot2(x0, y0);
		}
		var t1 = 0.5 - x1 * x1 - y1 * y1;
		if (t1 < 0) {
			n1 = 0;
		} else {
			t1 *= t1;
			n1 = t1 * t1 * gi1.dot2(x1, y1);
		}
		var t2 = 0.5 - x2 * x2 - y2 * y2;
		if (t2 < 0) {
			n2 = 0;
		} else {
			t2 *= t2;
			n2 = t2 * t2 * gi2.dot2(x2, y2);
		}
		return 70 * (n0 + n1 + n2);
	};
})(this);