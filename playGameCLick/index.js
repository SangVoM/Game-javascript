const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
CANVAS_WIDTH = canvas.width = window.innerWidth;
CANVAS_HEIGHT = canvas.height = window.innerHeight;

const colCanvas = document.getElementById('collisionCanvas');
const colCtx = colCanvas.getContext('2d');
CANVAS_WIDTH_COL = colCanvas.width = window.innerWidth;
CANVAS_HEIGHT_COL = colCanvas.height = window.innerHeight;

const newGame = document.getElementById('newGame');

ctx.font = '50px Impact';
let ravens = [];
let explosions = [];
let particles = [];
let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;
let score = 0;
let gameOver = 0;

class Raven {
    constructor() {
        this.sprintWidth = 271;
        this.sprintHeight = 194;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.sprintWidth * this.sizeModifier;
        this.height = this.sprintHeight * this.sizeModifier;
        this.x = CANVAS_WIDTH;
        this.y = Math.random()* (CANVAS_HEIGHT - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'raven.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), 
            Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5;
    }
    update(deltaTime) {
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 -this.width) this.markedForDeletion = true;
        this.timeSinceFlap += deltaTime;
        if (this.timeSinceFlap > this.maxFrame) {
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;
            if (this.hasTrail) {
                for(let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x, this.y, this.width, this.color))
                }
            }
        }
        if (this.x < 0 - this.width) gameOver = true;
    }
    draw() {
        colCtx.fillStyle = this.color;
        colCtx.fillRect(this.x, this.y,this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.sprintWidth, 0, this.sprintWidth, 
        this.sprintHeight, this.x, this.y, this.width, this.height)
    }
}
const raven = new Raven()

class Explosion {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = 'boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = 'boom.wav';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;
    }
    update(deltaTime) {
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            if (this.frame > 5) this.markedForDeletion = true;
        }
    }
    draw() {
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth,
            this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size);
    }
}

class Particle {
     constructor(x, y, size, color) {
        this.size = size
        this.x = x + this.size / 2 + Math.random() * 50 - 25;
        this.y = y + this.size / 3 + Math.random() * 50 - 25;
        this.radius = Math.random() * this.size / 10;
        this.maxRadius = Math.random() * 20 + 35;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
        this.color = color;
     }
     update(){
        this.x += this.speedX;
        this.radius += 0.3; 
        if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
     }
     draw() {
        ctx.save();
        ctx.globalAlpha = 1 - this.radius / this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore()
     }
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.fillText('Score: '+ score, 50, 75)
    ctx.fillStyle = 'white';
    ctx.fillText('Score: '+ score, 50, 80)
}

function drawGameOver() {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('Game Over, your score is ' + score, CANVAS_WIDTH / 2, CANVAS_HEIGHT/ 3)
    ctx.fillStyle = 'white';
    ctx.fillText('Game Over, your score is ' + score, CANVAS_WIDTH / 2 + 5, CANVAS_HEIGHT/ 3 + 5)
}

window.addEventListener('click', function(e){
    const detectPixelColor = colCtx.getImageData(e.x, e.y, 1, 1)
    const pc = detectPixelColor.data;
    ravens.forEach(object => {
        if (object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]) {
            object.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(object.x, object.y, object.width));
        }
    })
})

function animate(timestamp) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    colCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltaTime
    if (timeToNextRaven > ravenInterval) {
        ravens.push(new Raven());
        timeToNextRaven = 0;
        ravens.sort(function(a,b) {
            return a.width - b.width;
        })
    }
    drawScore();
    [ ...particles, ...ravens, ...explosions].forEach(object => object.update(deltaTime));
    [ ...particles, ...ravens, ...explosions].forEach(object => object.draw());
    ravens = ravens.filter(object => !object.markedForDeletion);
    explosions = explosions.filter(object => !object.markedForDeletion);
    particles = particles.filter(object => !object.markedForDeletion);
    if (!gameOver) requestAnimationFrame(animate);
    else {
        drawGameOver();
    }
}
animate(0)
