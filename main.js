'use strict';

class JCBGameEngine {
    constructor(nWidth, nHeight) {
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");
        this.canvas.width = this.nWidth = nWidth;
        this.canvas.height = this.nHeight = nHeight;
        this.fLastTime = 0;
    }

    clearscreen (sColor) {
    // Clear screen
        this.context.fillStyle = sColor;
        this.context.fillRect(0, 0, this.nWidth, this.nHeight);
    }
    
    box (x, y, w, color) {
        this.context.strokeStyle = color;
        this.context.strokeWidth = 1;
        this.context.strokeRect(x+0.5, y+0.5, w, w);
    }

    fillBox (x, y, w, color) {
        this.context.fillStyle = color;
        this.context.fillRect(x+0.5, y+0.5, w, w);
        this.context.strokeStyle = "black";
        this.context.strokeWidth = 1;
        this.context.strokeRect(x+0.5, y+0.5, w, w);
    }
    
    // initialization
    init () {
    }

    // gameloop
    gameloop (fElapsedTime) {
        return true;
    }
    
    // Termination
    term () {
    }

    ElapsedTime() {
        let fNow = + new Date();
        let fElapsed = fNow - this.fLastTime;
        this.fLastTime = fNow;
        return fElapsed;
    }
    
    // Run
    run () {
        let that = this;
        this.init();
        (function loop() {
            if (that.gameloop(that.ElapsedTime())) {
                requestAnimationFrame(loop);
            } else {
                that.term();
            }
        }());
    }
}

const LEFT_ARROW = 37;
const UP_ARROW = 38;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;
const KEY_SPACE = 32;
const KEY_PLUS = 107;
const KEY_MINUS = 109;

let nKeyCode = 0;
let fTimer = 0;

let nLeftKey = false;
let nRightKey = false;
let nOldLeftKey = false;
let nOldRightKey = false;
let bGameOver = false;

class SnakeEngine extends JCBGameEngine {
    constructor (nFieldWidth, nFieldHeight, nScale, nYOffset) {
        super (nFieldWidth * nScale, (nFieldHeight + nYOffset) * nScale);
        this.nFieldWidth = nFieldWidth;
        this.nFieldHeight = nFieldHeight;
        this.nScale = nScale;
        this.nYOffset = nYOffset;
    }
    
    // initialization    
    init () {
        this.aField = [];
        this.aSnake = [[60,22],[61,22],[62,22],[63,22],[64,22],[65,22],[66,22],[67,22],[68,22],[69,22]];
        
        this.nFoodX = 22;
        this.nFoodY = 22;
        
        this.nScore = 0;
        this.nSnakeDirection = 3;
        this.bDead = false;
    }

    // gameloop
    gameloop (fElapsedTime) {
        // TIMING ============
        fTimer += fElapsedTime;

        // KEYBOARD ===========
        if (!nOldLeftKey && nLeftKey) {
            nOldLeftKey = nLeftKey;
            this.nSnakeDirection--;
            if (this.nSnakeDirection === -1)
                this.nSnakeDirection = 3;
        } else if (!nOldRightKey && nRightKey) {
            nOldRightKey = nRightKey;
            this.nSnakeDirection++;
            if (this.nSnakeDirection === 4)
                this.nSnakeDirection = 0;
        }

        if (fTimer >= 100) {
            fTimer = 0;

            // GAME LOGIC ========

            // Clear Field;
            for (let y = 0; y < this.nFieldHeight; y++) {
                for (let x = 0; x < this.nFieldWidth; x++) {
                    this.aField[y * this.nFieldWidth + x] = 0;
                } 
            }

            bGameOver = this.bDead;
            
            // Put snake body in field
            this.aSnake.forEach((s) => {
                this.aField[s[1] * this.nFieldWidth + s[0]] = this.bDead ? "+" : "O";
            });

            // Put snake head in field
            let head = this.aSnake[0];
            this.aField[head[1] * this.nFieldWidth + head[0]] = this.bDead ? "X" : "@";

            // Put the food in field
            this.aField[this.nFoodY * this.nFieldWidth + this.nFoodX] = "%";
            
            // Update snake direction
            switch (this.nSnakeDirection) {
                case 0: // UP
                    this.aSnake.unshift([this.aSnake[0][0], this.aSnake[0][1]-1]);
                    break;
                case 1: // RIGHT
                    this.aSnake.unshift([this.aSnake[0][0]+1, this.aSnake[0][1]]);
                    break;
                case 2: // DOWN
                    this.aSnake.unshift([this.aSnake[0][0], this.aSnake[0][1]+1]);
                    break;
                case 3:  // LEFT
                    this.aSnake.unshift([this.aSnake[0][0]-1, this.aSnake[0][1]]);
                    break;
            }
            
            // Chop off snakes tail
            this.aSnake.pop();
            
            // Collision detection snake vs world
            if (this.aSnake[0][0] < 0 || this.aSnake[0][0] > this.nFieldWidth-1) 
                this.bDead = true;
            if (this.aSnake[0][1] < 0 || this.aSnake[0][1] > this.nFieldHeight-1) 
                this.bDead = true;
            
            // Collision detection snake vs food
            if (this.aSnake[0][0] === this.nFoodX && this.aSnake[0][1] === this.nFoodY) {
                this.nScore++;
                
                while (this.aField[this.nFoodY * this.nFieldWidth + this.nFoodX] !== 0) {
                    this.nFoodX = Math.floor((Math.random() * this.nFieldWidth));
                    this.nFoodY = Math.floor((Math.random() * this.nFieldHeight));
                }
         
                let elm = this.aSnake[this.aSnake.length-1];
                for (let i = 0; i < 5; i++) {
                    this.aSnake.push(elm);
                }
            }
            
            // Collision detection snake v snake
            let elm = this.aSnake[0];
            for (let i = 1; i < this.aSnake.length; i++) {
                if (elm[0] === this.aSnake[i][0] && 
                    elm[1] === this.aSnake[i][1]) {
                    this.bDead = true;
                    break;
                }
            }
            
        }
        
        // RENDER ============
        this.clearscreen("black");
        
        for (let i = 0; i < this.nFieldWidth; i++) {
            this.fillBox(i * this.nScale,  (this.nYOffset-1) * this.nScale, this.nScale, "gray"); 
        }
        this.context.fillStyle = "lime";
        this.context.font="20px Arial";
        this.context.fillText("S N A K E       Score: " + this.nScore, 
                              (this.nYOffset - 2) * this.nScale, 
                              (this.nYOffset - 2) * this.nScale);
        
        // Render field
        for (let y = 0; y < this.nFieldHeight; y++) {
            for (let x = 0; x < this.nFieldWidth; x++) {

                let xScreen = x * this.nScale;
                let yScreen = (y + this.nYOffset) * this.nScale;

                switch (this.aField[y * this.nFieldWidth + x]) {
                    case "O":
                    this.fillBox(xScreen, yScreen, this.nScale, "aqua");
                        break;
                    case "@":
                    this.fillBox(xScreen, yScreen, this.nScale, "purple");
                        break;
                    case "+":
                    this.fillBox(xScreen, yScreen, this.nScale, "red");
                        break;
                    case "X":
                    this.fillBox(xScreen, yScreen, this.nScale, "brown");
                        break;
                    case "%":
                    this.fillBox(xScreen, yScreen, this.nScale, "yellow");
                        break;
                } 
            } 
        }

        if (bGameOver) {
            this.context.fillStyle = "purple";
            this.context.font="50px Arial";
            this.context.fillText("GAME OVER !!!! PRESS SPACE TO CONTINUE", 
                                  10 * this.nScale, 
                                  (this.nYOffset - 1 + (this.nFieldHeight / 2)) * this.nScale);
            return false;
        }

        return true;
    }
    
    // Termination
    term () {
    }
}

window.onload = function () {
    (new SnakeEngine(100, 44, 15, 4)).run();
};


window.onkeydown = (e) => {
    switch(e.keyCode) {
        case LEFT_ARROW:
            nLeftKey = true;
            break;
        case RIGHT_ARROW:
            nRightKey = true;
            break;
        case KEY_SPACE:
            if (bGameOver) {
                bGameOver = false;
                (new SnakeEngine(100, 44, 15, 4)).run();
            }
            break;
    }
}

window.onkeyup = (e) => {
    switch(e.keyCode) {
        case LEFT_ARROW:
            nLeftKey = false;
            nOldLeftKey = false;
            break;
        case RIGHT_ARROW:
            nRightKey = false;
            nOldRightKey = false;
            break;
    }
}