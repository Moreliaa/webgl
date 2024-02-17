import { initBuffers } from "./cube3d_init-buffers.js";
import { drawScene } from "./cube3d_draw-scene.js";
import { initShaderProgram } from "../init-shader-program.js";

export function runCube3DDemo() {
    let cubeRotation = 0.0; // rotation in rad
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

    function isActive() {
        return document.querySelector("#button_cube3d_demo").classList.contains("active");
    }

    document.querySelector("#input_cube3d_fov").addEventListener("change", function (event) {
        document.querySelector("#input_cube3d_fov").setAttribute("value", event.target.value);
    });

    let then = 0;
    function render(now) {
        now *= 0.001; // conversion to seconds
        deltaTime = now - then;
        let isFirstFrame = then == 0;
        then = now;
        if (isFirstFrame) { // restart animation at 0 degrees rotation
            requestAnimationFrame(render);
            return;
        }

        let settings = {
            fov: document.querySelector("#input_cube3d_fov").getAttribute("value"),
            cube_translation: [0.0, 0.0, -6.0],
            cube_rotationSpeed: [0.3, 0.7, 1.0],
        };
        console.log(settings.fov);

        drawScene(gl, programInfo, buffers, cubeRotation, settings);
        cubeRotation = (cubeRotation + deltaTime); // animation loops every 3600° deg

        spanSquareRotation.textContent = (cubeRotation * (180 / Math.PI)).toFixed(1);

        if (isActive()) {
            requestAnimationFrame(render);
        }
        
    }

    requestAnimationFrame(render);

}