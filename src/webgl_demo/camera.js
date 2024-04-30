import { degToRad } from "./util.js";

const PAN_SPEED = 10;

export default class Camera {
    constructor(mouse) {
        this.pos = vec3.fromValues(0.0,8.0,8.0);
        this.up = vec3.fromValues(0.0,1.0,0.0);
        this.front = this.setFront(mouse);
    }

    setFront(mouse) {
        // Mouse
        let cameraFront = vec3.create();
        let yaw_rad = degToRad(mouse.yaw);
        let pitch_rad = degToRad(mouse.pitch);
        cameraFront[0] = Math.cos(yaw_rad) * Math.cos(pitch_rad);
        cameraFront[1] = Math.sin(pitch_rad);
        cameraFront[2] = Math.sin(yaw_rad) * Math.cos(pitch_rad);
        vec3.normalize(cameraFront, cameraFront);
        return cameraFront;
    }

    handleInput(mouse, keyboard, delta) {
        this.front = this.setFront(mouse);
        if (keyboard.keys.back && !keyboard.keys.forward) {
            let offset = vec3.create();
            vec3.scale(offset, this.front, delta * PAN_SPEED);
            vec3.sub(this.pos, this.pos, offset);
        } else if (keyboard.keys.forward && !keyboard.keys.back) {
            let offset = vec3.create();
            vec3.scale(offset, this.front, delta * PAN_SPEED);
            vec3.add(this.pos, this.pos, offset)
        }

        if (keyboard.keys.left && !keyboard.keys.right) {
            let offset = vec3.create();
            vec3.cross(offset, this.front, this.up);
            vec3.scale(offset, offset, delta * PAN_SPEED);
            vec3.sub(this.pos, this.pos, offset);
        } else if (keyboard.keys.right && !keyboard.keys.left) {
            let offset = vec3.create();
            vec3.cross(offset, this.front, this.up);
            vec3.scale(offset, offset, delta * PAN_SPEED);
            vec3.add(this.pos, this.pos, offset);
        }

        if (keyboard.keys.up && !keyboard.keys.down) {
            let offset = vec3.create();
            vec3.scale(offset, this.up, delta * PAN_SPEED);
            vec3.add(this.pos, this.pos, offset);
        } else if (!keyboard.keys.up && keyboard.keys.down) {
            let offset = vec3.create();
            vec3.scale(offset, this.up, delta * PAN_SPEED);
            vec3.sub(this.pos, this.pos, offset);
        }

        return { cameraPos: this.pos, cameraUp: this.up, cameraFront: this.front };
    }
}