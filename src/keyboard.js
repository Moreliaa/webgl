export default class Keyboard {
    constructor() {
        this.keys = { up: false, down: false, forward: false, back: false, right: false, left: false };
        
        document.onkeydown = (e) => {
            switch (e.key) {
                case "s":
                case "ArrowDown":
                    this.keys.back = true;
                    break;
                case "w":
                case "ArrowUp":
                    this.keys.forward = true;
                    break;
                case "a":
                case "ArrowLeft":
                    this.keys.left = true;
                    break;
                case "d":
                case "ArrowRight":
                    this.keys.right = true;
                    break;
                case "q":
                    this.keys.up = true;
                    break;
                case "e":
                    this.keys.down = true;
                    break;
            }
        };
    
        document.onkeyup = (e) => {
            switch (e.key) {
                case "s":
                case "ArrowDown":
                    this.keys.back = false;
                    break;
                case "w":
                case "ArrowUp":
                    this.keys.forward = false;
                    break;
                case "a":
                case "ArrowLeft":
                    this.keys.left = false;
                    break;
                case "d":
                case "ArrowRight":
                    this.keys.right = false;
                    break;
                case "q":
                    this.keys.up = false;
                    break;
                case "e":
                    this.keys.down = false;
                    break;
            }
        };
    }
}