import { degToRad } from "./util.js";

export default class MeshRenderer {
    constructor(mesh) {
        this.mesh = mesh;
    }

    render(gl, programInfo, commonDrawInfo_nodes, settings, camera, currentPointLightPosition, perspectiveMatrix, node) {
        const { mesh } = this;

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
        gl.bindTexture(gl.TEXTURE_2D, commonDrawInfo_nodes.textureDiffuse);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, commonDrawInfo_nodes.textureSpecular);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        for (const primitive of mesh.primitives) {
 setAttributes(gl, programInfo, primitive.bufferInfo);
            let hasIndices = primitive.bufferInfo.indices !== undefined;
            if (hasIndices) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive.bufferInfo.indices);
            }

            gl.uniformMatrix4fv(programInfo.uniforms.model, false, node.worldMatrix);

            let normalMatrix = mat3.create();
            mat3.fromMat4(normalMatrix, node.worldMatrix);
            mat3.invert(normalMatrix, normalMatrix);
            mat3.transpose(normalMatrix, normalMatrix);
            gl.uniformMatrix3fv(programInfo.uniforms.normal, false, normalMatrix);

            if (hasIndices) {
                gl.drawElements(gl.TRIANGLES, primitive.bufferInfo.numElements, primitive.bufferInfo.elementType, 0);
            } else {
                gl.drawArrays(gl.TRIANGLES, 0, primitive.bufferInfo.numElements)
            }
        }
    }
}

function setAttributes(gl, programInfo, bufferInfo) {
    let bufferInfoMapping = [
        { index: programInfo.attributes.position, bufferInfo: bufferInfo.attribs.a_POSITION },
        { index: programInfo.attributes.normal, bufferInfo: bufferInfo.attribs.a_NORMAL },
        { index: programInfo.attributes.texture, bufferInfo: bufferInfo.attribs.a_TEXCOORD_0 },
    ];
    for (let b of bufferInfoMapping) {
        let index = b.index;
        let bufferInfo = b.bufferInfo;

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.buffer);
        gl.vertexAttribPointer(index, bufferInfo.numComponents, bufferInfo.type, false, bufferInfo.stride, bufferInfo.offset);
        gl.enableVertexAttribArray(index);
    }
}