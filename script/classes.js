//Varibles/Constants;
const gravity = new Vector(0, 400);
const Smoke_img = new Image();
Smoke_img.src = "sprites/smoke.png";
const Player_img = new Image();
Player_img.src = "sprites/player.png";
const default_vol = 0.2;
const max_vol = 0.8;

const sound = new Howl({
	src: ['sound/sound.mp3'],
	sprite: {
		engine: [0, 3050],
		explode: [3050, 4000],
	},
	pool: 1,
	loop: true,
});
sound.volume(default_vol);

class Obstacle {
	constructor(x, y, w, h, dist) {
		this.pos = new Vector(x, y);
		this.w = w;
		this.h = h;
		this.hw = w / 2;
		this.hh = h / 2;
		this.wOff = this.w / 3.5;
		this.dist = dist;
	}
	update(dt, vel) {
		this.pos.x += vel.x * dt;
	}
	show() {
		ctx.beginPath();
		ctx.moveTo(this.pos.x - this.wOff, this.pos.y);
		ctx.lineTo(this.pos.x - this.wOff, this.dist);
		ctx.moveTo(this.pos.x + this.wOff, this.pos.y);
		ctx.lineTo(this.pos.x + this.wOff, this.dist);
		ctx.setLineDash([5, 1]);
		ctx.stroke();
		ctx.setLineDash([0, 0])
		ctx.fillRect(this.pos.x - this.hw, this.pos.y - this.hh, this.w, this.h);
		ctx.closePath();
	}
}

class Bar {
	constructor(x, topH, gap, w, obst) {
		this.pos = new Vector(x, 0);
		this.width = w;
		this.halfW = this.width / 2;
		this.topHeight = topH;
		this.gap = gap;
		this.passed = false;
		this.playerPassed = false;
		this.minScoreWidth = 100;
		this.obst = obst;

		this.bottomY = topH + gap;
		this.bottomHeight = ch - this.bottomY;
	}
	update(dt, vel) {
		this.pos = this.pos.add(vel.mult(dt));
		if (this.obst != null) {
			this.obst.update(dt, vel);
			this.obst.show();
		}
	}
	show() {
		ctx.beginPath();
		ctx.rect(this.pos.x - this.halfW, 0, this.width, this.topHeight);
		ctx.rect(this.pos.x - this.halfW, this.bottomY, this.width, this.bottomHeight);
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
	}
}
class Bars {
	constructor(player) {
		this.arr = [];
		this.player = player;
	}
	add(x, h, g, w, obst = null) {
		this.arr.push(new Bar(x, h, g, w, obst))
	}
	update(dt, barVel) {
		const player = this.player;
		for (let i = 0; i < this.arr.length; i++) {
			const curr = this.arr[i];
			if (curr.pos.x + curr.width / 2 < 0) {
				this.arr.splice(i, 1);
				i--;
				continue;
			}
			if ((!player.hasCollision) && Math.abs(curr.pos.x - player.pos.x) <= curr.width + 20) {
				if (player.pos.x + player.halfSize > curr.pos.x - curr.halfW &&
					player.pos.x - player.halfSize < curr.pos.x + curr.halfW)
				{ //Positions adjusted for the sprite; 8,4
					if (curr.obst) {
						const obst = curr.obst;
						const obst_box = {
								x: obst.pos.x - obst.hw,
								y: obst.pos.y - obst.hh,
								w: obst.w,
								h: obst.h
							},
							ply_box = {
								x: player.pos.x - player.halfSize,
								y: player.pos.y - player.halfSize + 8,
								w: player.size,
								h: player.size - 12,
							};


						if (hasCollision(ply_box, obst_box)) {
							player.collidedWith = i;
							player.onCollision()
						};
					}
					if (player.pos.y - player.halfSize + 8 > curr.topHeight && player.pos.y + player.halfSize - 4 < curr.topHeight + curr.gap) {
						//Passed through the hole;
						if ((!curr.playerPassed) && curr.width >= curr.minScoreWidth) {
							player.score++;
							curr.playerPassed = true;
						}
					} else {
						player.collidedWith = i;
						//Collison with the poles;
						player.onCollision();
					}
				}
			};
			curr.update(dt, barVel);
			curr.show();
		};

		if (player.hasCollision && player.collidedWith > 0) {
			const curr = this.arr[player.collidedWith],
				last = this.arr[player.collidedWith - 1] || { pos: { x: 0, y: 0 }, halfW: 0, bottomY: curr.bottomY, bottomHeight: curr.topHeight };
			const width = (curr.pos.x - curr.halfW) - (last.pos.x + last.halfW);
			ctx.beginPath();
			ctx.rect(curr.pos.x - curr.halfW - width, 0, width, Math.min(curr.topHeight, last.topHeight));
			ctx.rect(curr.pos.x - curr.halfW - width, Math.min(last.bottomY, curr.bottomY), width, ch - Math.min(last.bottomY, curr.bottomY));
			ctx.fill();
			ctx.stroke();
			ctx.closePath();

		}
	};
}

class Smoke {
	constructor(x, y, size = 32, vel = new Vector(0, 0), life, scaleStart = 1, scaleFactor = 1) {
		this.x = x;
		this.y = y;
		this.pos = new Vector(this.x, this.y)
		this.vel = vel;
		this.size = size;
		this.img = Smoke_img;
		this.life = life;
		this.age = 0;

		this.scaleStart = scaleStart;
		this.scaleFactor = scaleFactor;
	}
	update(dt) {
		this.pos = this.pos.add(this.vel.mult(dt))
	}
	show() {
		let opacity = map_range(this.age, 0, this.life, 1, 0);
		if (opacity <= 0) {
			opacity = 0;
		}
		ctx.save()
		ctx.globalAlpha = opacity
		ctx.translate(this.pos.x, this.pos.y);
		let scale = (this.scaleStart + (1 - opacity));
		ctx.scale(scale, scale);
		ctx.drawImage(this.img, 0, 0, 32, 32, -this.size / 2, -this.size / 2, this.size, this.size)

		ctx.globalAlpha = 1;
		ctx.restore();
	}
}
class Smokes {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.arr = [];
		this.allDead = false;
	}
	add(vel, size, life, scaleStart, scaleFactor) {
		size = size || Math.floor(random(10, 40))
		life = life || random(200, 250)
		this.arr.push(new Smoke(this.x, this.y, size, vel, life, scaleStart, scaleFactor));
	}
	addN(n, size, life, scaleStart, scaleFactor, vel) {
		let angle = 0;
		for (let i = 0; i < n; i++) {
			angle += 360 / n;
			this.add(vel || vectorFromAngle(angle, Math.floor(random(10, 20))), size, life, scaleStart, scaleFactor);
		}
	}
	update(dt) {
		for (let i = 0; i < this.arr.length; i++) {
			let curr = this.arr[i]
			if (curr.age > curr.life) {
				this.arr.splice(i, 1);
				i -= 1;
				if (this.arr.length == 0) {
					this.allDead = true;
				}
				continue;
			}
			curr.update(dt)
			curr.age += 1;
			curr.show();
		}
	}
}
class Player {
	constructor(x, y, props) {
		this.props = props;
		this.pos = new Vector(x, y);
		this.vel = new Vector(0, 100);
		this.acc = gravity;
		this.size = 30;
		this.halfSize = this.size / 2;
		this.moveUpCounter = 0;
		this.lastMoveUp = 0;
		this.dt = 1;
		this.lastSpeedUp = Date.now();

		this.score = 0;
		this.hasCollision = false;
		this.smokes = new Smokes(x, y);
		this.img_index = 1;
		this.lastChange = 0;
		this.frameTime = 50;

		this.soundTime = 0;
	}
	moveUp() {
		if (!this.hasCollision) {

			if (soundToggle.checked && (sound.volume() == default_vol)) {
				sound.fade(default_vol, max_vol, 800);
			}
			this.moveUpCounter++;
			if (Date.now() - this.lastMoveUp > 1000) {
				this.moveUpCounter = 0;
			}
			this.vel = new Vector(0, -150 - (powerIncrToggle.checked?(this.moveUpCounter * 10):0));
			this.lastMoveUp = Date.now();
		}
	}
	update(dt) {
		this.dt = dt;

		if (soundToggle.checked && ((!this.hasCollision) && sound.volume() == max_vol && (Date.now() - this.lastMoveUp > 800))) {
			sound.fade(max_vol, default_vol, 500);
		}

		this.vel = this.vel.add(this.acc.multScalar(dt));
		this.pos = this.pos.add(this.vel.multScalar(dt));
		this.smokes.x = this.pos.x;
		this.smokes.y = this.pos.y;
		this.smokes.update(dt);
		this.rotateAngle = map_range(this.vel.y, -200, 200, 15, -15);
	}
	show() {
		if (Date.now() - this.lastMoveUp < 600) {
			this.frameTime = 20;
		} else {
			this.frameTime = 50;
		}
		if (smokeToggle.checked && (Math.random() < 0.4) && (Date.now() - this.lastMoveUp < 500)) {
			for (let k = 0; k < random(2, 5); k++) {
				this.smokes.add(
					new Vector(0, random(20, 60, true)).add(this.props.barVelocity.add(new Vector(0, Math.floor(random(5, 15)) * (Math.random() > 0.5 ? -1 : 1)))),
					random(8, 13),
					random(80, 120)
				);
			}
		}

		if (this.img_index > 6) {
			this.img_index = 1;
		}
		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(rad(this.rotateAngle));
		ctx.drawImage(Player_img, 64 * (this.img_index - 1), 0, 64, 64,
			-this.halfSize, -this.halfSize, this.size, this.size)

		ctx.restore();

		if (Date.now() - this.lastChange > this.frameTime) {
			this.img_index++;
			this.lastChange = Date.now();
		}
	}
	onCollision() {
		//Collision animation;
		if (this.pos.y - this.halfSize < 0) {
			this.vel = this.vel.multScalar(-0.8).add(new Vector(-80, 0));
		}
		else if (this.pos.y + this.halfSize > ch) {
			this.vel = this.vel.multScalar(-0.8).add(new Vector(-80, 0));
		} else {
			this.vel = this.vel.add(this.props.barVelocity);
		}
		this.smokes.addN(10);
		this.props.barVelocity.x = 0;
		if (!this.hasCollision && soundToggle.checked) {
			sound.stop();
			sound.volume(1)
			sound.play('explode');
			setTimeout(()=>{
				sound.stop();
			},800)
		}
		this.hasCollision = true;
	}
}
