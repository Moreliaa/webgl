import { degToRad } from "./util.js";

export default class Node {
    constructor(source, id = undefined, textureInfo = undefined) {
        this.id = id;
        this.source = source;
        this.parent = undefined;
        this.children = [];
        
        this.localMatrix = mat4.create();
        this.worldMatrix = mat4.create();
        this.drawables = [];
        this.textureInfo = textureInfo;
    }

    translate(translation) {
        this.source.translate(translation);
    }

    rotateSourceX(angleDeg) {
        let angleRad = degToRad(angleDeg);
        this.source.rotateOrigX(angleRad);
    }

    rotateSourceY(angleDeg) {
        let angleRad = degToRad(angleDeg);
        this.source.rotateOrigY(angleRad);
    }

    rotateSourceZ(angleDeg) {
        let angleRad = degToRad(angleDeg);
        this.source.rotateOrigZ(angleRad);
    }

    clone() {
        let n = new Node(this.source.clone(), undefined);
        for (let child of this.children) {
            let c = child.clone();
            c.setParent(n);
        }
        n.drawables = this.drawables;
        return n;
    }

    updateLocalMatrix() {
        this.localMatrix = this.source.getMatrix();
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

    traverse(func) {
        func(this);
        for (let child of this.children) {
            child.traverse(func);
        }
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

    rotateZ(rotation) {
        let speed = 30;
        let rotation_rad = degToRad(rotation * speed);
        this.source.rotateZ(rotation_rad);
    }
}