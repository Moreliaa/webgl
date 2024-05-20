import { degToRad } from "./util.js";

export default class TRS {
    constructor(position = [0, 0, 0], rotation = [0, 0, 0, 1], scale = [1, 1, 1]) {
    // quaternion rotation
      this.origPosition = vec3.fromValues(...position);
      this.origRotation = quat.fromValues(...rotation);
      this.origScale = vec3.fromValues(...scale);
      this.position = vec3.fromValues(...position);
      this.rotation = quat.fromValues(...rotation);
      this.scale = vec3.fromValues(...scale);
    }

    clone() {
        return new TRS(this.position, this.rotation, this.scale);
    }

    getMatrix(m) {
      //dst = dst || new Float32Array(16);
      m = m || mat4.create();
      mat4.fromRotationTranslationScale(m, this.rotation, this.position, this.scale);
      return m;
    }

    rotateZ(rotation) {
        this.position[0] = this.origPosition[1] * Math.sin(rotation) + this.origPosition[0] * Math.cos(rotation);
        this.position[1] = this.origPosition[1] * Math.cos(rotation) + this.origPosition[0] * Math.sin(rotation);
        quat.rotateZ(this.rotation, this.origRotation, rotation * 0.1);
    }
  }