export function initBuffers(gl) {
    return {
        position: initPositionBuffer(gl),
        color: initColorBuffer(gl),
    };
}

function initPositionBuffer(gl) {
    // triangle-strip representation of the square vertices
    const positions_square = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions_square), gl.STATIC_DRAW);

    return positionBuffer;
}

function initColorBuffer(gl) {
    const colors = [
        1.0, 1.0, 1.0, 1.0, // white
        1.0, 0.0, 0.0, 1.0, // red
        0.0, 1.0, 0.0, 1.0, // green
        0.0, 0.0, 1.0, 1.0, // blue
    ];
    
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return colorBuffer;
}