import { initBuffers } from "./cube3d_init-buffers.js";
import { drawScene } from "./cube3d_draw-scene.js";
import { initShaderProgram } from "../init-shader-program.js";
import { loadTexture } from "../load-texture.js";

export function runCube3DDemo() {
    let cubeRotation = 0.0; // rotation in rad
    let deltaTime = 0;

    const canvas = document.querySelector("#glcanvas");
    const gl = canvas.getContext("webgl");

    if (gl === null) {
        alert("Failed to init WebGL.");
        return;
    }

    const programInfo_color = initShaderProgram_color(gl);
    const programInfo_texture = initShaderProgram_texture(gl);
    if (!programInfo_color || !programInfo_texture) {
        return;
    }
    const buffers = initBuffers(gl);
    const texture = loadTexture(gl, "assets/mytexture.png");
    // Flip image pixels into the bottom-to-top order that WebGL expects.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const rotation = document.querySelector("#squareRotation");

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
            textured: document.querySelector("#input_cube3d_textured").checked,
            cube_translation: [0.0, 0.0, -6.0],
            cube_rotationSpeed: [0.3, 0.7, 1.0],
        };

        let programInfo = settings.textured ? programInfo_texture : programInfo_color;
        drawScene(gl, programInfo, buffers, cubeRotation, settings, texture);
        cubeRotation = (cubeRotation + deltaTime); // animation loops every 3600° deg

        rotation.textContent = (cubeRotation * (180 / Math.PI)).toFixed(1);

        if (isActive()) {
            requestAnimationFrame(render);
        }
        
    }

    requestAnimationFrame(render);

}

function initShaderProgram_color(gl) {
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
    return programInfo;
}

function initShaderProgram_texture(gl) {
    const vsSource_Texture = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;
    }
    `;

    const fsSource_Texture = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main() {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
    `;

    const shaderProgram_Texture = initShaderProgram(gl, vsSource_Texture, fsSource_Texture);
    if (!shaderProgram_Texture) {
        return;
    }
    const programInfo_Texture = {
        program: shaderProgram_Texture,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram_Texture, "aVertexPosition"),
            textureCoordinates: gl.getAttribLocation(shaderProgram_Texture, "aTextureCoord"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram_Texture, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram_Texture, "uModelViewMatrix"),
            uSampler: gl.getUniformLocation(shaderProgram_Texture, "uSampler"),
        },
    };
    return programInfo_Texture;
}