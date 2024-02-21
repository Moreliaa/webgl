import { initBuffers } from "./rs_init-buffers.js";
import { drawScene } from "./rs_draw-scene.js";
import { initShaderProgram } from "../init-shader-program.js";

export function runRotatingSquareDemo() {
    let squareRotation = 0.0; // rotation in rad
    let deltaTime = 0;

    const canvas = document.querySelector("#glcanvas");
    const gl = canvas.getContext("webgl");

    if (gl === null) {
        alert("Failed to init WebGL.");
        return;
    }

    // Vertex shader program
    // lowp: precision qualifier - https://www.khronos.org/opengl/wiki/Type_Qualifier_(GLSL)#Precision_qualifiers
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
    }
    `;

    // Fragment shader program
    const fsSource = `
    varying lowp vec4 vColor;

    void main() {
        gl_FragColor = vColor;
    }
    `;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    
    if (!shaderProgram) {
        return;
    }

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
        },
    };

    const buffers = initBuffers(gl);

    const spanSquareRotation = document.querySelector("#squareRotation");

    let then = 0;
    function render(now) {
        now *= 0.001; // conversion to seconds
        deltaTime = now - then;
        then = now;

        drawScene(gl, programInfo, buffers, squareRotation);
        squareRotation = (squareRotation + deltaTime) % (Math.PI * 2);

        spanSquareRotation.textContent = (squareRotation * (180 / Math.PI)).toFixed(1);

        if (isActive()) {
            requestAnimationFrame(render);
        }
    }

    requestAnimationFrame(render);

}

function isActive() {
    return document.querySelector("#button_rs_demo").classList.contains("active");
}