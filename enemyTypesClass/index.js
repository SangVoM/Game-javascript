document.addEventListener("DOMContentLoaded", function(e) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    CANVAS_WIDTH = canvas.width = 500;
    CANVAS_HEIGHT = canvas.height = 700;

    class Game {
        constructor(ctx, width, height) {
            this.ctx = ctx;
            this.width = width;
            this.height = height;
            this.enemies = []
            this.enemyInterval = 500;
            this.enemyTimer = 0
            this.enemyTypes = ['worm', 'ghost', 'spider']
        }
        update(deltaTime) {
            this.enemies = this.enemies.filter(object => !object.markedForDeletion)
            if (this.enemyTimer > this.enemyInterval) {
                this.#addNewEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime
            }
            this.enemies.forEach(object => object.update(deltaTime));
        }
        draw() {
            this.enemies.forEach(object => object.draw(this.ctx));
        }
        #addNewEnemy() {
            const randomEnemy = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
            if (randomEnemy == 'worm') this.enemies.push(new Worm(this))
            else if (randomEnemy == 'ghost') this.enemies.push(new Ghost(this))
            else if (randomEnemy == 'spider') this.enemies.push(new Spider(this))
            this.enemies.push(new Worm(this))
        }
    }

    class Enemy {
        constructor(game) {
            this.game = game;
            this.markedForDeletion = false;
            this.framex;
            this.maxFrame = 5;
            this.frameInterval = 100;
            this.frameTimer = 0;
        }
        update(deltaTime) {
            this.x -= this.speed * deltaTime;
            if (this.x < 0 - this.width) this.markedForDeletion = true;
            if (this.frameTimer > this.frameInterval) {
                if (this.framex < this.maxFrame) this.framex++;
                else this.framex = 0;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime
            }
        }
        draw(ctx) {
            ctx.drawImage(this.image, this.framex * this.spriteWidth, 0, this.spriteWidth, 
            this.spriteHeight, this.x, this.y, this.width, this.height);
        }
    }

    class Worm extends Enemy {
        constructor(game) {
            super(game)
            this.spriteWidth = 229;
            this.spriteHeight = 171;
            this.width = this.spriteWidth / 2;
            this.height = this.spriteHeight/2;
            this.x = this.game.width;
            this.y = this.game.height - this.height;
            this.image = worm;
            this.speed = Math.random() * 0.1 + 0.1;
        }
    }

    class Spider extends Enemy {
        constructor(game) {
            super(game)
            this.spriteWidth = 310;
            this.spriteHeight = 175;
            this.width = this.spriteWidth / 2;
            this.height = this.spriteHeight/2;
            this.x = Math.random() * this.game.width;
            this.y = 1 - this.height;
            this.image = spider;
            this.speed = 0;
            this.speedY = Math.random() * 0.1 + 0.1;
            this.maxLength = Math.random() *  this.game.height;
        }
        update(deltaTime) {
            super.update(deltaTime)
            if (this.y)
            this.y += this.speedY * deltaTime;
            if (this.y > this.maxLength) this.speedY *= -1;
        }
        draw(ctx) {
            ctx.beginPath();
            ctx.moveTo(this.x + this.width /2, 0);
            ctx.lineTo(this.x + this.width / 2, this.y + 10);
            ctx.stroke();
            super.draw(ctx)
        }
    }

    class Ghost extends Enemy {
        constructor(game) {
            super(game)
            this.spriteWidth = 261;
            this.spriteHeight = 209;
            this.x = this.game.width;
            this.y = Math.random() * this.game.height * 0.6;
            this.width = this.spriteWidth / 2;
            this.height = this.spriteHeight/2;
            this.image = ghost;
            this.speed = Math.random() * 0.2 + 0.1;
            this.angle = 0;
            this.curve = Math.random() * 3;
        }
        update(deltaTime){
            super.update(deltaTime)
            this.y += Math.sin(this.angle) * this.curve
            this.angle += 0.04
        }
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = 0.7;
            super.draw(ctx)
            ctx.restore();
        }
    }

    let game = new Game(ctx, CANVAS_WIDTH, CANVAS_HEIGHT)
    let lastTime = 1;
    function animate(timeStamp) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        game.update(deltaTime)
        game.draw(ctx)
        requestAnimationFrame(animate)
    }
    animate(0)
})