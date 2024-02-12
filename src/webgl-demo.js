main();

function main() {
    const canvas = document.querySelector("#glcanvas");
    const gl = canvas.getContext("webgl");

    if (gl === null) {
        alert("Failed to init WebGL.");
        return;
    }

    gl.clearColor(0.0,0.0,0.0,1.0); // Set clear color to black, fully opaque
    gl.clear(gl.COLOR_BUFFER_BIT); // Clear the color buffer with specified clear color
}