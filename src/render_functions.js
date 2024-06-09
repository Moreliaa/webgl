import { degToRad } from "./util.js";

export function renderDrawable(gl, mesh, programInfo, settings, camera, currentPointLightPosition, perspectiveMatrix, skybox, node) {
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
    gl.uniform1i(programInfo.uniforms.isReflection, settings.isReflection);

    gl.uniform1i(programInfo.uniforms.samplerDiffuse, 0);
    gl.uniform1i(programInfo.uniforms.samplerSpecular, 1);
    gl.uniform1i(programInfo.uniforms.cubeMap, 2);

    if (node.textureInfo) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, node.textureInfo.textureDiffuse);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, node.textureInfo.textureSpecular);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    }

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox);
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

export function renderDrawableAsteroid(gl, mesh, programInfo, settings, camera, currentPointLightPosition, perspectiveMatrix, skybox, node) {
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
    gl.uniform1i(programInfo.uniforms.isReflection, settings.isReflection);

    gl.uniform1i(programInfo.uniforms.samplerDiffuse, 0);
    gl.uniform1i(programInfo.uniforms.samplerSpecular, 1);
    gl.uniform1i(programInfo.uniforms.cubeMap, 2);

    if (node.textureInfo) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, node.textureInfo.textureDiffuse);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, node.textureInfo.textureSpecular);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    }

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    
    for (const primitive of mesh.primitives) {
        setAttributes(gl, programInfo, primitive.bufferInfo);
        let hasIndices = primitive.bufferInfo.indices !== undefined;
        if (hasIndices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive.bufferInfo.indices);
        }

        let numAsteroids = 10000;
        let buffers = createAsteroidBuffers(gl, node.worldMatrix, numAsteroids);

        

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.worldMatrixBuffer);
        gl.vertexAttribPointer(programInfo.attributes.modelMatrix, 4, gl.FLOAT, false, 16 * 4, 0);
        gl.enableVertexAttribArray(programInfo.attributes.modelMatrix);
        gl.vertexAttribPointer(programInfo.attributes.modelMatrix+1, 4, gl.FLOAT, false, 16 * 4, 16 * 1);
        gl.enableVertexAttribArray(programInfo.attributes.modelMatrix+1);
        gl.vertexAttribPointer(programInfo.attributes.modelMatrix+2, 4, gl.FLOAT, false, 16 * 4, 16 * 2);
        gl.enableVertexAttribArray(programInfo.attributes.modelMatrix+2);
        gl.vertexAttribPointer(programInfo.attributes.modelMatrix+3, 4, gl.FLOAT, false, 16 * 4, 16 * 3);
        gl.enableVertexAttribArray(programInfo.attributes.modelMatrix+3);

        // TODO remember to rename normal -> normalMatrix
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalMatrixBuffer);
        gl.vertexAttribPointer(programInfo.attributes.normalMatrix, 4, gl.FLOAT, false, 12 * 3, 0);
        gl.enableVertexAttribArray(programInfo.attributes.normalMatrix);
        gl.vertexAttribPointer(programInfo.attributes.normalMatrix+1, 4, gl.FLOAT, false, 12 * 3, 12 * 1);
        gl.enableVertexAttribArray(programInfo.attributes.normalMatrix+1);
        gl.vertexAttribPointer(programInfo.attributes.normalMatrix+2, 4, gl.FLOAT, false, 12 * 3, 12 * 2);
        gl.enableVertexAttribArray(programInfo.attributes.normalMatrix+2);

        
        gl.vertexAttribDivisor(programInfo.attributes.modelMatrix, 1);
        gl.vertexAttribDivisor(programInfo.attributes.modelMatrix+1, 1);
        gl.vertexAttribDivisor(programInfo.attributes.modelMatrix+2, 1);
        gl.vertexAttribDivisor(programInfo.attributes.modelMatrix+3, 1);

        gl.vertexAttribDivisor(programInfo.attributes.normalMatrix, 1);
        gl.vertexAttribDivisor(programInfo.attributes.normalMatrix+1, 1);
        gl.vertexAttribDivisor(programInfo.attributes.normalMatrix+2, 1);

        if (hasIndices) {
            gl.drawElementsInstanced(gl.TRIANGLES, primitive.bufferInfo.numElements, primitive.bufferInfo.elementType, 0, numAsteroids);
        } else {
            gl.drawArraysInstanced(gl.TRIANGLES, 0, primitive.bufferInfo.numElements, numAsteroids);
        }
        
    }
    gl.vertexAttribDivisor(programInfo.attributes.modelMatrix, 0);
    gl.vertexAttribDivisor(programInfo.attributes.modelMatrix+1, 0);
    gl.vertexAttribDivisor(programInfo.attributes.modelMatrix+2, 0);
    gl.vertexAttribDivisor(programInfo.attributes.modelMatrix+3, 0);

    gl.vertexAttribDivisor(programInfo.attributes.normalMatrix, 0);
    gl.vertexAttribDivisor(programInfo.attributes.normalMatrix+1, 0);
    gl.vertexAttribDivisor(programInfo.attributes.normalMatrix+2, 0);
    
}

let asteroidBuffers;
/** @param {WebGL2RenderingContext} gl
 *  @param {mat4} worldMatrix
 */
function createAsteroidBuffers(gl, worldMatrix, numAsteroids)  {
if (asteroidBuffers) {
    return asteroidBuffers;
}
    let dataWorld = [];
    let dataNormal = [];
    for (let i = 0; i < numAsteroids; i++) {
        let mag = 300;
        let offset = vec3.fromValues(
            Math.random() * mag - (mag / 2),
            Math.random() * mag - (mag / 2),
            Math.random() * mag - (mag / 2)
        );
        let worldMatrixInstance = mat4.clone(worldMatrix);
        mat4.translate(worldMatrixInstance, worldMatrixInstance, offset);

        let normalMatrix = mat3.create();
        mat3.fromMat4(normalMatrix, worldMatrixInstance);
        mat3.invert(normalMatrix, normalMatrix);
        mat3.transpose(normalMatrix, normalMatrix);
        
        for (let j = 0; j < 16; j++) {
            dataWorld.push(worldMatrixInstance[j]);
        }
        for (let j = 0; j < 12; j++) {
            dataNormal.push(normalMatrix[j] ?? 0);
        }

    }

    let worldMatrixBuffer = gl.createBuffer();
    let normalMatrixBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, worldMatrixBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dataWorld), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalMatrixBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dataNormal), gl.STATIC_DRAW);
    asteroidBuffers = { worldMatrixBuffer, normalMatrixBuffer }
    return asteroidBuffers;
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