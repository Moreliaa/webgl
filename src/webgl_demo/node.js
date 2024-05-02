import { degToRad } from "./util.js";

export default class Node {
    constructor(translation, rotation, scale) {
        this.parent = undefined;
        this.children = [];
        console.log(translation, rotation, scale)
        this.origTranslation = translation.slice();
        this.origRotation = rotation;
        this.origScale = scale.slice();
        this.translation = translation;
        this.rotation = rotation;
        this.scale = scale;
        
        this.localMatrix = mat4.create();
        this.worldMatrix = mat4.create();
        this.drawInfo = {};
    }

    updateLocalMatrix() {
        let localMatrix = mat4.create();
        mat4.translate(localMatrix, localMatrix, this.translation);
        mat4.rotate(localMatrix, localMatrix, this.rotation, [0,0,1]);
        mat4.scale(localMatrix, localMatrix, this.scale);
        this.localMatrix = localMatrix;
    }

    rotate(rotation) {
        let speed = 30;
        this.translation[0] = this.origTranslation[1] * Math.sin(degToRad(rotation * speed)) + this.origTranslation[0] * Math.cos(degToRad(rotation * speed));
        this.translation[1] = this.origTranslation[1] * Math.cos(degToRad(rotation * speed)) + this.origTranslation[0] * Math.sin(degToRad(rotation * speed));
    }

    setParent(parent) {
        if (this.parent) {
            for (let i = 0; i < this.parent.children.length; i++) {
                let child = this.parent.children[i];
                if (child === this) {
                    this.parent.children.splice(i, 1);
                    break;
                }
            }
        }

        if(parent) {
            parent.children.push(this);
        }
        this.parent = parent;
    }

    updateWorldMatrix() {
        this.updateLocalMatrix();
        let parentWorldMatrix = this.parent ? this.parent.worldMatrix : undefined;
        if (parentWorldMatrix) {
            mat4.mul(this.worldMatrix, parentWorldMatrix, this.localMatrix);
        } else  {
            this.worldMatrix = mat4.clone(this.localMatrix);
        }

        for (let c of this.children) {
            c.updateWorldMatrix();
        }
    }

    
}