var levelConfig;

GamePlayManager = {
	init: function() {
		game.scale.scaleMode= Phaser.ScaleManager.SHOW_ALL;
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
	},
	preload: function() {
		game.load.image("background", "assets/images/background.png");
		game.load.image("objects1", "assets/images/objects1.png");
		game.load.image("objects2", "assets/images/objects2.png");
		game.load.image("zombie", "assets/images/zombie.png");
		game.load.image("zombieBoy", "assets/images/zombieBoy.png");
		game.load.image("iconLive", "assets/images/iconLive.png");

		game.load.spritesheet("smoke", "assets/images/smoke.png", 125, 125, 20);

	//boton
	    game.load.spritesheet("buttonPlay", "assets/images/buttonPlay.png", 200, 76, 2);
	    game.load.spritesheet("buttonContinue", "assets/images/buttonContinue.png", 200, 76, 2);

	    game.load.json("level0", "assets/config/level0.json");
	    game.load.json("level1", "assets/config/level1.json");


     game.load.bitmapFont("fontWhite", "assets/fonts/bitmapFonts/fontWhite.png", 
     	"assets/fonts/bitmapFonts/fontWhite.fnt");

	
	//MUSIC
	game.load.audio("loopMusic", "assets/sounds/loopmusic.mp3");
	game.load.audio("sfxLoose", "assets/sounds/sfxLoose.mp3");
	game.load.audio("sfxHit", "assets/sounds/sfxHit.mp3");
	

},
	create: function() {
		game.add.sprite(0, 0, "background");			
		this.zombieGroup = game.add.group();
		this.smokeGroup = game.add.group();

		game.add.sprite(0, 0, "objects1");
		game.add.sprite(0, 0, "objects2");	   

        this.lives = 3;
		this.arrayIconLives = [];
		this.arrayIconLives[0] = game.add.sprite(200, game.height -45, "iconLive");
		this.arrayIconLives[1] = game.add.sprite(250, game.height -45, "iconLive");
		this.arrayIconLives[2] = game.add.sprite(300, game.height -45, "iconLive");
		//Score
		this.currentScore =0;
		this.txtCurrentScore = game.add.bitmapText(950,35, "fontWhite", this.currentScore.toString(), 60);
		this.txtCurrentScore.anchor.setTo(0.5)

		this.txtTimeLeft = game.add.bitmapText(800,35, "fontWhite", "", 60);
		this.txtTimeLeft.anchor.setTo(0.5);

		//LEVEL TEXT
        this.txtCurrentLevel = game.add.bitmapText(70, game.height - 20, 'fontWhite', "LEVEL 1", 25);
        this.txtCurrentLevel.anchor.setTo(0, 1);
        
        //Game Over
        this.txtMsgEndLevel = game.add.bitmapText(game.width/4 , game.height/4, 'fontWhite', "GAME OVER", 55);
        this.txtMsgEndLevel.anchor.setTo(0.5);
        this.txtMsgEndLevel.visible = false;

		var pixel = game.add.bitmapData(1,1);
		pixel.ctx.fillStyle = "#000000";
		pixel.ctx.fillRect(0,0,1,1);

		this.bgMenu = game.add.sprite(0,0,pixel);
		this.bgMenu.width = game.width;
		this.bgMenu.height = game.height;
		this.bgMenu.alpha = 0.5;


		//button play
		this.buttonPlay = game.add.button(game.world.centerX, game.world.centerY, "buttonPlay", this.startGame, this,
			1,0,1,0);
		this.buttonPlay.anchor.setTo(0.5, 0.5);

		//button continue
		this.buttonContinue = game.add.button(game.world.centerX, game.world.centerY, "buttonContinue", 
			this.nextLevel, this,
			1,0,1,0);
		this.buttonContinue.anchor.setTo(0.5, 0.5);
		this.buttonContinue.visible = false;

		
		//score txt
		this.scoreTextTween = game.add.tween(this.txtCurrentScore.scale).to({
			x: [1, 1.5, 1],
			y: [1, 1.5,1]
		}, 500, Phaser.Easing.Elastic.Out, false, 0, 0, false);

	
		//MUSIC
	this.loopMusic = game.add.audio("loopMusic");
	this.sfxLoose =  game.add.audio("sfxLoose");
	this.sfxHit = game.add.audio("sfxHit");

    },
    nextLevel: function(){
    	this.level++;
    	this.prepareLevel();
    },
    startGame: function(){
    	this.level = 0;    		
    	this.currentScore =0;
    	this.lives = 3;
    	this.refreshArrayLives();
    	this.prepareLevel();
    },
    refreshArrayLives: function(){
        for(var i=0; i<this.arrayIconLives.length; i++){
            this.arrayIconLives[i].visible=false;
        }
        for(var i=0; i<this.lives; i++){
            this.arrayIconLives[i].visible=true;
        }
},
    looseLive:function(){
    	this.sfxLoose.play();

    	this.lives--;
    	this.refreshArrayLives();
    	if(this.lives<=0){
    		this.gameOver();
    	}

    },
    gameOver: function(){
    	this.loopMusic.stop();

    	this.txtMsgEndLevel.visible = true;
        this.txtMsgEndLevel.text = "GAME OVER";
    	game.time.events.remove(this.timerDown);
    	this.destroyZombieGroup();
        this.bgMenu.visible = true;
        this.buttonPlay.visible = true;
        game.time.events.remove(this.timerShowZombie);

    },
    destroyZombieGroup:function(){
        this.zombieGroup.forEach( function(zombie){
            zombie.kill();
        }, this);
        this.zombieGroup.removeAll(true);
    },
    prepareLevel: function(){
    	this.loopMusic.loop=true;
    	this.loopMusic.play();

    	this.txtCurrentLevel.text = "LEVEL"+(this.level+1);
    	this.buttonPlay.visible = false;
    	this.bgMenu.visible = false;
    	this.buttonContinue.visible = false;
    	this.txtMsgEndLevel.visible = false;

    	this.txtCurrentScore.text = this.currentScore.toString();
       	levelConfig = game.cache.getJSON("level"+this.level);
			        
        for(var i=0; i<levelConfig.zombies.length; i++){
            var zombie = new Zombie(i, levelConfig.zombies[i].sprite, levelConfig.zombies[i].x0, levelConfig.zombies[i].y0, 
            	levelConfig.zombies[i].x1, levelConfig.zombies[i].y1, levelConfig.zombies[i].scale, levelConfig.zombies[i].angle, 
            	levelConfig.zombies[i].timeAnimation, levelConfig.zombies[i].timeDelay);
	            this.zombieGroup.add(zombie);
	        }		
	        this.timeLeft = levelConfig.timeLeft;
	        this.txtTimeLeft.text = this.timeLeft.toString();
			game.time.events.add(1000, this.callBackShowZombie, this);      //10 zombies 
			this.timerDown = game.time.events.loop(1000, this.callBackTimeDown, this);   //Loop

	},
	callBackTimeDown:function(){
		this.timeLeft --;
	        this.txtTimeLeft.text = this.timeLeft.toString();
	        if(this.timeLeft<=0){
	        	this.levelComplete();

	        }
	},
	levelComplete:function(){
		this.loopMusic.stop();

		this.txtMsgEndLevel.visible = true;
        this.txtMsgEndLevel.text = "LEVEL COMPLETE";

	    game.time.events.remove(this.timerDown);
		this.bgMenu.visible=true;
		this.buttonContinue.visible = true;
		this.destroyZombieGroup();
		game.time.events.remove(this.timerShowZombie);
	},

    callBackShowZombie: function(){
    	this.timerShowZombie  = game.time.events.add(levelConfig.minTime + Math.random()*levelConfig.deltaTime,
            this.callBackShowZombie, this);
        this.showZombie();
    },
    showZombie: function(){
     	var newZombie = this.getRandomZombie();
        	if(newZombie!=null){
    		newZombie.Appear();
    	}
			        	
    },
    getRandomZombie:function(){
	    var zombieAvailable = false;
			        
			        //very
	    var amountZombies = this.zombieGroup.length;
		for(var i=0; i<amountZombies; i++){
	    if(!this.zombieGroup.children[i].alive){
	    zombieAvailable = true;
	}
   }
		if(!zombieAvailable){
	    return null;
	}
			        
		var index = game.rnd.integerInRange(0, amountZombies-1);
		var randomZombie = this.zombieGroup.children[index];
		while(randomZombie.alive){
	    index = game.rnd.integerInRange(0, amountZombies-1);
	    randomZombie = this.zombieGroup.children[index];
	 }
		//console.log("INDEX:"+index);
	    return randomZombie;
	},
	hitZombie:function(id, x, y, scale, angle){
		this.increaseScore();
		
		var currentSmoke = this.smokeGroup.getFirstDead();
		if(currentSmoke==null){
			currentSmoke = this.smokeGroup.create(x,y,"smoke");
			currentSmoke.animations.add("explode", [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
			currentSmoke.anchor.setTo(0.5, 1);

		}
		currentSmoke.reset(x,y);
		currentSmoke.scale.setTo(scale);
		currentSmoke.angle = angle;
		currentSmoke.animExplode = currentSmoke.animations.play('explode', 16);
        currentSmoke.animExplode.onComplete.add(function (sprite, animation) {
            sprite.kill();
        },this);
	},
	increaseScore:function(){
		this.sfxHit.play();

		this.currentScore +=100;
		this.txtCurrentScore.text = this.currentScore.toString();
		this.scoreTextTween.start();

	},
	update: function(){

				}
}
var game = new Phaser.Game(1012, 569, Phaser.AUTO);
game.state.add("gameplay", GamePlayManager);
game.state.start("gameplay");
