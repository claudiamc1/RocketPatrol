class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }
    preload() {
        this.load.image('frog', './assets/frog.png');
        this.load.image('fly', './assets/fly.png');
        this.load.image('sky', './assets/sky.png');
        this.load.spritesheet('explosion', './assets/explosion.png', {frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9});
    }
    create() {
        this.sky = this.add.tileSprite(0, 0, 640, 480, 'sky').setOrigin(0, 0);

        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0);
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        //this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);

        this.p1Frog = new Frog(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'frog').setOrigin(0.5, 0);

        this.fly1 = new Fly(this, game.config.width + borderUISize*6, borderUISize*4, 'fly', 0, 30).setOrigin(0, 0);
        this.fly2 = new Fly(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'fly', 0, 20).setOrigin(0,0);
        this.fly3 = new Fly(this, game.config.width, borderUISize*6 + borderPadding*4, 'fly', 0, 10).setOrigin(0,0);

        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9, first: 0}),
            frameRate: 30
        });

        this.p1Score = 0;
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding * 2, this.p1Score, scoreConfig);

        this.gameOver = false;
        scoreConfig.fixedWidth = 0;
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or <- for Menu', scoreConfig).setOrigin(0.5);
            this.gameOver = true;
        }, null, this);
    }
    update() {
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }

        this.sky.tilePositionX -= 4;
        
        if(!this.gameOver) {
            this.p1Frog.update();
            this.fly1.update();
            this.fly2.update();
            this.fly3.update();
        }

        if(this.checkCollision(this.p1Frog, this.fly3)) {
            this.p1Frog.reset();
            this.flyExplode(this.fly3);
        }
        if(this.checkCollision(this.p1Frog, this.fly2)) {
            this.p1Frog.reset();
            this.flyExplode(this.fly2);
        }
        if(this.checkCollision(this.p1Frog, this.fly1)) {
            this.p1Frog.reset();
            this.flyExplode(this.fly1);
        }
        
    }
    checkCollision(frog, fly) {
        if (frog.x < fly.x + fly.width && 
            frog.x + frog.width > fly.x && 
            frog.y < fly.y + fly.height &&
            frog.height + frog.y > fly. y) {
               return true;
        } else{
            return false;
        }
    }
    flyExplode(fly) {
        fly.alpha = 0;
        let boom = this.add.sprite(fly.x, fly.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');
        boom.on('animationcomplete', () => {
            fly.reset();
            fly.alpha = 1;
            boom.destroy();
        });
        this.p1Score += fly.points;
        this.scoreLeft.text = this.p1Score;
        this.sound.play('sfx_pop');
    }
}