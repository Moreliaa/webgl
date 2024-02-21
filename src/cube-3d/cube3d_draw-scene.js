export function drawScene(gl, programInfo, buffers, cubeRotation, settings, texture) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = (settings.fov * Math.PI) / 180; // conversion to rad
    const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView, aspectRatio, zNear, zFar);

    const modelViewMatrix = mat4.create();

    mat4.translate(
        modelViewMatrix, // destination
        modelViewMatrix, // source
        settings.cube_translation,
    );

    mat4.rotate(
        modelViewMatrix,
        modelViewMatrix,
        cubeRotation * settings.cube_rotationSpeed[2], // amount to rotate in radians
        [0, 0, 1], // rotation axis
    );
    mat4.rotate(
        modelViewMatrix,
        modelViewMatrix,
        cubeRotation * settings.cube_rotationSpeed[1], // amount to rotate in radians
        [0, 1, 0], // rotation axis
    );
    mat4.rotate(
        modelViewMatrix,
        modelViewMatrix,
        cubeRotation * settings.cube_rotationSpeed[0], // amount to rotate in radians
        [0, 0, 0], // rotation axis
    );

    let normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    setPositionAttribute(gl, programInfo, buffers);
    if (settings.textured) {
        setTextureAttribute(gl, programInfo, buffers);
        setNormalAttribute(gl, programInfo, buffers);
    } else {
        setColorAttribute(gl, programInfo, buffers);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix,
    );

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix,
    );

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix,
    );

    // WebGL provides a minimum of 8 texture units, the first is gl.TEXTURE0
    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);


    const offset = 0; // starting index in the array of vector points
    const vertexCount = 36; // number of vertices to be drawn, 36 from 6 vertices per face
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, offset);
}

function setPositionAttribute(gl, programInfo, buffers) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0; // offset of bytes in between consecutive vertex attributes
    const offset = 0; // offset in bytes of the first component in the vertex attribute array
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

function setColorAttribute(gl, programInfo, buffers) {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}

function setTextureAttribute(gl, programInfo, buffers) {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoordinates);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoordinates,
        numComponents,
        type,
        normalize,
        stride,
        offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoordinates);

}

function setNormalAttribute(gl, programInfo, buffers) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}