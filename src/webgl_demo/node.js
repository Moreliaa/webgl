import { degToRad } from "./util.js";

export default class Node {
    constructor(source, id = undefined, drawInfo = undefined) {
        this.id = id;
        this.source = source;
        this.parent = undefined;
        this.children = [];
        
        this.localMatrix = mat4.create();
        this.worldMatrix = mat4.create();
        this.drawInfo = drawInfo;
        this.drawables = [];
    }

    clone() {
        let n = new Node(this.source.clone(), undefined, this.drawInfo);
        for (let child of this.children) {
            let c = child.clone();
            n.children.push(c);
        }
        n.drawables = this.drawables;
        return n;
    }

    updateLocalMatrix() {
        this.localMatrix = this.source.getMatrix();
    }

    rotateZ(rotation) {
        let speed = 30;
        let rotation_rad = degToRad(rotation * speed);
        this.source.rotateZ(rotation_rad);
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

    draw(gl, settings, camera, currentPointLightPosition, perspectiveMatrix) {
        if (this.source) {
            this.source.getMatrix(this.localMatrix);
        }
        if (!this.drawInfo) {
            return;
        }

        let drawInfo = this.drawInfo;
        let programInfo = drawInfo.programInfo;

        gl.useProgram(programInfo.program);        

        gl.uniformMatrix4fv(programInfo.uniforms.perspective, false, perspectiveMatrix);
        gl.uniformMatrix4fv(programInfo.uniforms.view, false, camera.viewMatrix);

        gl.uniform3fv(programInfo.uniforms.diffuseColor, settings.diffuseColor);
        gl.uniform3fv(programInfo.uniforms.specularColor, settings.specularColor);
        gl.uniform1f(programInfo.uniforms.shininess, settings.shininess);

        gl.uniform3fv(programInfo.uniforms.lightAmbient, settings.lightAmbient);
        gl.uniform3fv(programInfo.uniforms.lightDiffuse, settings.lightDiffuse);
        gl.uniform3fv(programInfo.uniforms.lightSpecular, settings.lightSpecular);
        gl.uniform3fv(programInfo.uniforms.lightPosition, currentPointLightPosition);
        gl.uniform1f(programInfo.uniforms.attenuationLinear, settings.attenuationLinear);
        gl.uniform1f(programInfo.uniforms.attenuationSquare, settings.attenuationSquare);

        gl.uniform3fv(programInfo.uniforms.cameraPosition, camera.pos);

        gl.uniform1i(programInfo.uniforms.isDirLighting, settings.isDirLighting);
        gl.uniform3fv(programInfo.uniforms.dirLightDirection, settings.dirLightDirection);
        gl.uniform3fv(programInfo.uniforms.dirLightAmbient, settings.dirLightAmbient);
        gl.uniform3fv(programInfo.uniforms.dirLightDiffuse, settings.dirLightDiffuse);
        gl.uniform3fv(programInfo.uniforms.dirLightSpecular, settings.dirLightSpecular);

        gl.uniform1i(programInfo.uniforms.isFlashlight, settings.isFlashlight);
        gl.uniform3fv(programInfo.uniforms.flashlightPosition, camera.pos);
        gl.uniform3fv(programInfo.uniforms.flashlightDirection, camera.front);
        gl.uniform1f(programInfo.uniforms.flashlightAngleCutoffInner, Math.cos(degToRad(settings.flashlightAngleCutoffInner)));
        gl.uniform1f(programInfo.uniforms.flashlightAngleCutoffOuter, Math.cos(degToRad(settings.flashlightAngleCutoffOuter)));
        gl.uniform3fv(programInfo.uniforms.flashlightAmbient, settings.flashlightAmbient);
        gl.uniform3fv(programInfo.uniforms.flashlightDiffuse, settings.flashlightDiffuse);
        gl.uniform3fv(programInfo.uniforms.flashlightSpecular, settings.flashlightSpecular);

        gl.uniform1i(programInfo.uniforms.isTextured, settings.isTextured);
        gl.uniform1i(programInfo.uniforms.isPhongShading, settings.isPhongShading());
        gl.uniform1i(programInfo.uniforms.isBlinnPhongShading, settings.isBlinnPhongShading());

        gl.uniform1i(programInfo.uniforms.samplerDiffuse, 0);
        gl.uniform1i(programInfo.uniforms.samplerSpecular, 1);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, drawInfo.textureDiffuse);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, drawInfo.textureSpecular);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        setAttributes(gl, drawInfo.bufferInfo);
    
        gl.uniformMatrix4fv(programInfo.uniforms.model, false, this.worldMatrix);

        let normalMatrix = mat3.create();
        mat3.fromMat4(normalMatrix, this.worldMatrix);
        mat3.invert(normalMatrix, normalMatrix);
        mat3.transpose(normalMatrix, normalMatrix);
        gl.uniformMatrix3fv(programInfo.uniforms.normal, false, normalMatrix);
        
        gl.drawArrays(gl.TRIANGLES, 0, drawInfo.numVertices);
    }
}

function setAttributes(gl, bufferInfo) {
    for (let b of bufferInfo) {
        let index = b.index;
        let buffer = b.buffer;
        let size = b.size;
        if (index === undefined || size === undefined || buffer === undefined) {
            console.error("setAttributes: incorrect input format: ", b);
            continue;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(index, size, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(index);
    }
}