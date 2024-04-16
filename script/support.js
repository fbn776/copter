function hasCollision(rect1, rect2) {
	return (rect1.x < rect2.x + rect2.w &&
		rect1.x + rect1.w > rect2.x &&
		rect1.y < rect2.y + rect2.h &&
		rect1.y + rect1.h > rect2.y);
}

CanvasRenderingContext2D.prototype.line = function (x1, y1, x2, y2, opt = {}) {
	let ctx = this;
	ctx.beginPath();
	let strokeColor = (opt.color || opt.strokColor || "black"),
		lineWidth = (opt.width || opt.lineWidth || 1);
	if (opt.dash || opt.dashed) {
		ctx.setLineDash(opt.dash || opt.dashed);
	}
	ctx.strokeStyle = strokeColor;
	ctx.lineWidth = lineWidth;
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
	ctx.setLineDash([0, 0])
	ctx.closePath();
};

CanvasRenderingContext2D.prototype.box = function (x, y, w, h, opt = {}) {
	let ctx = this;
	ctx.beginPath();
	ctx.strokeStyle = (opt.color || opt.strokeStyle || opt.borderColor || "black");
	ctx.fillStyle = (opt.fill || opt.fillColor || opt.bg || opt.bgColor || "black");
	ctx.lineWidth = (opt.width || opt.lineWidth || opt.borderWidth || 1);
	ctx.rect(x, y, w, h);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
};

function Log(elm) {
	this.elm = elm;
	this.log = function (txt) {
		this.elm.innerHTML = txt;
	}
}

function s(e) {
	return document.querySelector(e)
}

function Vector(x, y, z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;

	this.toStr = function () {
		return `(${this.x},${this.y},${this.z})`;
	}
	this.multScalar = function (s) {
		return new Vector(this.x * s, this.y * s, this.z * s);
	}
	this.mult = this.multScalar;
	this.neg = function () {
		return this.multScalar(-1);
	}
	this.add = function (b) {
		return new Vector(this.x + b.x, this.y + b.y, this.z + b.z)
	}
}

function random2dVec(l = 1) {
	let angle = Math.random() * (2 * Math.PI);
	return new Vector(l * Math.cos(angle), l * Math.sin(angle), 0);
}

function vecFromAngle(angle, l = 1) {
	return new Vector(l * Math.cos(angle), l * Math.sin(angle));
}

function vectorFromAngle(angle, length = 1) {
	return new Vector(length * Math.cos(angle), length * Math.sin(angle));
}

function randomVector(len) {
	return vectorFromAngle(rad(Math.random() * 360), len || 1);
}

//Strings functions
function small(x) {
	return x.toLowerCase()
}

function rad(x) {
	return (Math.PI / 180) * x;
}

function round(value, precision) {
	var multiplier = Math.pow(10, precision || 0);
	return Math.round(value * multiplier) / multiplier;
}

function map_range(x, inMin, inMax, outMin, outMax) {
	return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function random(x, y, round = false) {
	let r = round ? Math.floor(Math.random()) : Math.random();
	return x + r * (y - x);
}

//Objects and array functions
Object.prototype.getKeys = function () {
	return Object.getOwnPropertyNames(this);
}

Array.prototype.randomItem = function () {
	return this[Math.floor(Math.random() * this.length)];
}

function clearCanvas(c) { c.width = c.width; };
const width = window.innerWidth;
const height = window.innerHeight;

function setUpCanvas(c, w, h) {
	c.width = w;
	c.height = h;

	return {
		canvas: c,
		ctx: c.getContext("2d"),
		cw: c.width,
		ch: c.height,
		cx: c.width / 2,
		cy: c.height / 2
	}
}

function TimerSlide(data, time) {
	let i = 1;
	for (let a of data) {
		setTimeout(function () {
			a();
		}, time * i);
		i++;
	}
}

function newMsg(txt) {
	msgElm.style.transform = "translateY(-500%)";
	msgElm.style.opacity = 0;
	setTimeout(() => {
		msgElm.innerHTML = txt;
		setTimeout(() => {
			msgElm.style.transform = "translateY(0px)";
			msgElm.style.opacity = 1;
		}, 0);
	}, 200);
}

function closeWin(elm, trans = 200) {
	elm.style.opacity = 0;
	setTimeout(() => {
		elm.style.display = "none";
	}, trans);
}

function openWin(elm, disp = "block") {
	elm.style.display = disp;
	setTimeout(() => {
		elm.style.opacity = 1;
	}, 0);
}
