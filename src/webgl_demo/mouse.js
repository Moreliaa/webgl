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
            yaw += e.movementX * mouseSensitivity;
            //yaw = yaw % 360;
            pitch -= e.movementY * mouseSensitivity;
            if (pitch > pitch_max) {
                pitch = pitch_max;
            } else if (pitch < pitch_min) {
                pitch = pitch_min;
            }
        }
    }
}