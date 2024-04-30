export default class Mouse {
    constructor(canvas) {
        this.yaw = -90;
        this.pitch = 0;
        this.pitch_max = 89;
        this.pitch_min = -89;
        this.mouseSensitivity = 0.5;

        async function captureMouse(e) {
            await canvas.requestPointerLock({
                unadjustedMovement: true, // turn off mouse acceleration
            });
        }
        
        canvas.onclick = captureMouse;

        document.onmousemove = (e) => {
            if (document.pointerLockElement !== canvas) {
                return;
            }
            this.yaw += e.movementX * this.mouseSensitivity;
            //yaw = yaw % 360;
            this.pitch -= e.movementY * this.mouseSensitivity;
            if (this.pitch > this.pitch_max) {
                this.pitch = this.pitch_max;
            } else if (this.pitch < this.pitch_min) {
                this.pitch = this.pitch_min;
            }
        }
    }
}