export function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0; //Level of detail. Level 0 is the base image level and level n is the n-th mipmap reduction level.
    const internalFormat = gl.RGBA; // color components in the texture
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA; // format of the texel data
    const srcType = gl.UNSIGNED_BYTE; // data type of the texel data
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel,
    );

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image,
        );

        // WebGL1 can only use non power of 2 textures with filtering set
        // to NEAREST or LINEAR and it can not generate a mipmap for them.
        // Their wrapping mode must also be set to CLAMP_TO_EDGE.
        // On the other hand if the texture is a power of 2 in both dimensions
        // then WebGL can do higher quality filtering, it can use mipmap,
        // and it can set the wrapping mode to REPEAT or MIRRORED_REPEAT.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // Disable mip mapping
            // prevent texture coordinate s & t wrapping (repeating)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            // texture minification filter, gl.NEAREST also possible
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }  
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}