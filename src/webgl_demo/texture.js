export function loadTexture(gl, path) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    let image = new Image();
    image.onload = function () {
        let target = gl.TEXTURE_2D;
        let level = 0;
        let internalformat = gl.RGBA;
        let format = gl.RGBA;
        let type = gl.UNSIGNED_BYTE;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(target, level, internalformat, format, type, image);
        if (isPow2(image.width) && isPow2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

    }
    image.src = path;

    return texture;
}

/**
 * @param {WebGL2RenderingContext} gl
 */
export function loadSkybox(gl) {
    let tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
    let faces = [
        {path: "assets/skybox/right.jpg", target: gl.TEXTURE_CUBE_MAP_POSITIVE_X}, // right
        {path: "assets/skybox/left.jpg", target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X}, // left
        {path: "assets/skybox/top.jpg", target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y}, // top
        {path: "assets/skybox/bottom.jpg", target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y}, // bottom
        {path: "assets/skybox/back.jpg", target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z}, // back
        {path: "assets/skybox/front.jpg", target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z}, // front
    ];
    for (let face of faces) {
        let image = new Image(); // todo texture image
        image.onload = function() {
            gl.texImage2D(face.target, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        }
        image.src = face.path;
    }
    return tex;
}

function isPow2(val) {
    return val & (val - 1) === 0;
}