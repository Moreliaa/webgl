export function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = (45 * Math.PI) / 180; // conversion to rad
    const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView, aspectRatio, zNear, zFar);

    const modelViewMatrix = mat4.create();

    // translate square plane away from the camera by 6 units
    const zOffset_plane = -6.0;
    mat4.translate(
        modelViewMatrix, // destination
        modelViewMatrix, // source
        [0.0, 0.0, zOffset_plane],
    );

    setPositionAttribute(gl, programInfo, buffers);
    setColorAttribute(gl, programInfo, buffers);

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

    const offset = 0; // starting index in the array of vector points
    const vertexCount = 4; // number of vertices to be drawn
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
}

function setPositionAttribute(gl, programInfo, buffers) {
    const numComponents = 2; // number of components per vertex attribute, in this case we only specified x and y coordinates
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