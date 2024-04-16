const scores = {
	easy: 0,
	medium: 0,
	hard: 0,
	best: 0,
}
//For initially getting/setting the scores from/to the local storage;
function checkScores() {
	for (let a of scores.getKeys()) {
		let val = localStorage.getItem(a + "-heli-score");
		if (val == null) {
			localStorage.setItem(a + "-heli-score", scores[a]);
		} else {
			scores[a] = parseInt(val);
		}
		s("#" + a + "HS").innerHTML = scores[a];
	}
}
//For setting the scores to local storage as per the scores constant;
function setScores() {
	for (let a of scores.getKeys()) {
		localStorage.setItem(a + "-heli-score", scores[a]);
		s("#" + a + "HS").innerHTML = scores[a];
	}
}
//setScores();
checkScores();

//Reset score;
function resetScore(mode){
	const confo = confirm("Do you want to reset "+(mode=='all'?mode+" your":"your "+mode)+" score?");
	if(confo){
		switch(mode) {
			case 'easy':
				scores.easy = 0;
				break;
			case 'medium':
				scores.medium = 0;
			case 'hard':
				scores.hard = 0;
				break;
			case 'best':
				scores["best"] = Math.max(scores.easy,scores.medium,scores.hard)
				break;
			case 'all':
				scores.easy = scores.medium = scores.hard = scores.best = 0;
				break;
		};
		setScores();
	}
}

const { canvas, ctx, cx, cy, cw, ch } = setUpCanvas(s("#main"), width, height);
const score_elm = s(".score"),
	HomeWindow = s(".home-window"),
	GameWindow = s(".game-window"),
	msgWindow = s(".message"),
	pauseMenu = s(".pause-menu");

//Game difficulties;
const Game_modes = {
	easy: {
		mode: "Easy",
		top_noise_min: 50,
		top_noise_max: 50,
		gap_noise_max: 50,
		height: 150,
		bar_gap_min: 250,
		bar_gap_max: 400,
		obstacle_chance: 0.05,
		barVelocity: -110,
		speedUpTime: 20000,
		speedUpAmount: 5,
	},
	medium: {
		mode: "Medium",
		top_noise_min: 10,
		top_noise_max: 20,
		gap_noise_max: 10,
		height: 280,
		bar_gap_min: 150,
		bar_gap_max: 250,
		obstacle_chance: 0.2,
		barVelocity: -140,
		speedUpTime: 10000,
		speedUpAmount: 10,
	},
	hard: {
		mode: "Hard",
		top_noise_min: 10,
		top_noise_max: 18,
		gap_noise_max: 10,
		height: 270,
		bar_gap_min: 150,
		bar_gap_max: 230,
		obstacle_chance: 0.5,
		barVelocity: -170,
		speedUpTime: 8000,
		speedUpAmount: 13,
	}
};

function initGame(mode, reqDelay = true) {
	clearCanvas(canvas);
	let props = {
		score: 0,
		stop: false,
		gameEnd: function() {
			resume_btn.style.display = "none";
			setTimeout(() => {
				pauseMenu.style.display = "block";
				setTimeout(() => {
					pauseMenu.style.opacity = 1;
				}, 0);
				pauseHS.innerHTML = props.score;
				props.stop = true;
			}, 1000);
		}
	};

	pauseMenu.style.display = "none";
	pauseMenu.style.opacity = 0;
	resume_btn.style.display = "block";
	msgWindow.style.display = "flex";
	HomeWindow.style.display = "none";
	HomeWindow.style.opacity = 0;

	GameWindow.style.display = "block";
	setTimeout(() => {
		GameWindow.style.opacity = 1;
	}, 0);
	if (reqDelay) {
		newMsg(mode.mode + " Mode Selected");
	}
	TimerSlide([
		() => {
			newMsg("Starts in 3..")
		},
		() => {
			newMsg("2..");
		},
		() => {
			newMsg("1..");
		},
		() => {
			newMsg("Go!");
		},
		() => {
			msgWindow.style.display = "none";
			gameFrame(mode, props);
		}
	], 500);

	let paused = false;
	pause_btn.onclick = function() {
		sound.stop();
		pauseMenu.style.display = "block";
		setTimeout(() => {
			pauseMenu.style.opacity = 1;
		}, 0);
		pauseHS.innerHTML = props.score;
		props.stop = true;
		paused = true;
	};

	resume_btn.onclick = function() {
		sound.play('engine');
		paused = false;
		pauseMenu.style.display = "none";
		pauseMenu.style.opacity = 0;
		props.stop = false;
	}
	home_btn.onclick = function() {
		sound.stop();
		score_elm.innerHTML = 0;
		let cont = true;
		if (paused) {
			cont = confirm("Do you want to quit? Your scores will be lost, if you quit.")
		}
		if (cont) {
			newMsg("");
			pauseMenu.style.display = "none";
			pauseMenu.style.opacity = 0;
			HomeWindow.style.display = "block";
			setTimeout(() => {
				HomeWindow.style.opacity = 1;
			}, 0)
			GameWindow.style.display = "none";
			GameWindow.style.opacity = 0;
		}
	};

	restart_btn.onclick = function() {
		score_elm.innerHTML = 0;
		setTimeout(() => {
			pauseMenu.style.display = "none";
			pauseMenu.style.opacity = 0;
		}, 0);
		initGame(mode, false);
		newMsg("");
	}
}

function gameFrame(mode, props) {
	if (soundToggle.checked) {
		sound.volume(max_vol);
		sound.play('engine');
	}
	const barVel = new Vector(mode.barVelocity, 0);
	const seed = randWrldToggle.checked?Math.random():0;
	noise.seed(seed);

	const player = new Player(50, cy, { barVelocity: barVel });
	const bars = new Bars(player);

	canvas.onclick = function() {
		player.moveUp();
	}

	window.onkeydown = (e) => {
		if(e.code === "Space" || e.code === "ArrowUp")
			player.moveUp();
	}


	let bar_count = 0;
	//Initial Bar

	bars.add(cw + 90, 150, 400, 180);

	let now;
	let lastTime = Date.now();

	function draw() {
		now = Date.now();
		if (!props.stop) {
			const dt = (now - lastTime) / 1000.0;
			//---------------------->
			ctx.clearRect(0, 0, cw, ch);

			//Bars creation;
			const lastBar = bars.arr[bars.arr.length - 1];
			if ((!lastBar.passed) && (lastBar.pos.x + (lastBar.width / 2) <= cw + 20)) {
				bar_count++;
				lastBar.passed = true;

				bar_top_height = map_range(Math.abs(noise.simplex2(bar_count / mode.top_noise_max, bar_count / mode.top_noise_min)), 0, 1, mode.height, ch - mode.height);
				bar_gap = map_range(Math.abs(noise.simplex2(1, bar_count / mode.gap_noise_max)), 0, 1, mode.bar_gap_min, mode.bar_gap_max);
				bar_gap = (bar_top_height + bar_gap >= ch) ? ch - bar_top_height - 10 : bar_gap;
				const bar_width = Math.floor(random(8, 150));
				const x_pos = lastBar.pos.x + (lastBar.width / 2) + (bar_width / 2);

				let obst = null;
				if (obstToggle.checked && (Math.random() < mode.obstacle_chance && bar_width > 45)) {
					const obst_w = random(15, 40, true);
					obst = new Obstacle(x_pos + random(-obst_w, obst_w), bar_top_height + random(30, bar_gap - 10), obst_w, random(5, 10, true), bar_top_height);
				};
				bars.add(x_pos, bar_top_height, bar_gap, bar_width, obst);
			};

			bars.update(dt, barVel);
			player.update(dt);
			player.show();

			if (player.score == 0 && (!player.hasCollision) && (player.pos.y - player.halfSize < 0 || player.pos.y + player.halfSize > ch)) {
				//Collision with the floor or roof;
				player.onCollision();
			}

			if ((!player.hasCollision) && (now - player.lastSpeedUp > mode.speedUpTime)) {
				barVel.x -= mode.speedUpAmount;
				player.lastSpeedUp = now;
			};
			props.score = player.score;
			score_elm.innerHTML = player.score;
			
			if ((!player.once) && player.hasCollision) {
				props.gameEnd();
				if (player.score > scores["best"]) {
					scores["best"] = player.score;
					setScores();
				};
				if (player.score > scores[small(mode.mode)]) {
					scores[small(mode.mode)] = player.score;
					setScores();
				}
				player.once = true;
			}
		}
		lastTime = now;
		props.animFrame = window.requestAnimationFrame(draw);
	}
	draw();
}
