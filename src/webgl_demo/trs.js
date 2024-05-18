export default class TRS {
    constructor(position = [0, 0, 0], rotation = [0, 0, 0, 1], scale = [1, 1, 1]) {
    // quaternion rotation
      this.position = vec3.fromValues(...position);
      this.rotation = quat.fromValues(...rotation);
      this.scale = vec3.fromValues(...scale);
    }
    getMatrix(m) {
      //dst = dst || new Float32Array(16);
      m = m || mat4.create();
      mat4.fromRotationTranslationScale(m, this.rotation, this.position, this.scale);
      return m;
    }
  }