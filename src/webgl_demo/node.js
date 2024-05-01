export default class Node {
    constructor(translation, rotation, scale) {
        this.parent = undefined;
        this.children = [];
        
        let localMatrix = mat4.create();
        console.log(translation, rotation, scale)
        mat4.translate(localMatrix, localMatrix, translation);
        mat4.rotate(localMatrix, localMatrix, rotation, [0,0,1]);
        mat4.scale(localMatrix, localMatrix, scale);
        this.localMatrix = localMatrix;
        this.worldMatrix = mat4.create();
        this.drawInfo = {};
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