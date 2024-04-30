export function initBuffers(gl) {
    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let vertices = [ // x y z
        -0.5, -0.5, -0.5,    -0.5,  0.5, -0.5,    0.5, -0.5, -0.5,       -0.5,  0.5, -0.5,   0.5,  0.5, -0.5, 0.5, -0.5, -0.5,     // front
         0.5,  0.5,  0.5,    -0.5,  0.5,  0.5,    0.5, -0.5,  0.5,       -0.5,  0.5,  0.5,  -0.5, -0.5,  0.5, 0.5, -0.5,  0.5,    // back        
        -0.5,  0.5, -0.5,    -0.5,  0.5,  0.5,    0.5,  0.5, -0.5,       -0.5,  0.5,  0.5,   0.5,  0.5,  0.5, 0.5,  0.5, -0.5,     // top
        -0.5, -0.5, -0.5,    0.5, -0.5, -0.5,    -0.5, -0.5,  0.5,   -0.5, -0.5,  0.5,   0.5, -0.5, -0.5,    0.5, -0.5,  0.5, // bottom
        -0.5, -0.5, -0.5,   -0.5, -0.5,  0.5,    -0.5,  0.5, -0.5,   -0.5,  0.5, -0.5,  -0.5, -0.5,  0.5,   -0.5,  0.5,  0.5, // left
         0.5, -0.5, -0.5,   0.5,  0.5, -0.5, 0.5, -0.5,  0.5,         0.5,  0.5, -0.5,   0.5,  0.5,  0.5, 0.5, -0.5,  0.5,    // right
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    let normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    let normals = [
        [0.0, 0.0, -1.0], // front
        [0.0, 0.0, 1.0], // back
        [0.0, 1.0, 0.0], // top
        [0.0, -1.0, 0.0], // bottom
        [-1.0, 0.0, 0.0], // left
        [1.0, 0.0, 0.0], // right
    ];
    let normalsExpanded = [];
    for (let n of normals) {
        let numVertices = 6;
        for (let i = 0; i < numVertices; i++) {
            normalsExpanded.push(n[0]);
            normalsExpanded.push(n[1]);
            normalsExpanded.push(n[2]);
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalsExpanded), gl.STATIC_DRAW);

    let textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    let textureCoordinates = [
        // Front
        0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 
        // Back
        0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 
        // Top
        0.0, 0.0, 0.0, 1.0, 1.0, 0.0,  0.0, 1.0, 1.0, 1.0,1.0, 0.0, 
        // Bottom
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
        // Right
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
        // Left
        0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    return { vertexBuffer, normalsBuffer, textureBuffer };
}