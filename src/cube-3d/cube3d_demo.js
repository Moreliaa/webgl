import { initBuffers } from "./cube3d_init-buffers.js";
import { drawScene } from "./cube3d_draw-scene.js";
import { initShaderProgram } from "../init-shader-program.js";
import { loadTexture, initVideoTexture } from "../load-texture.js";

let copyVideo = false; // will be set to true when video can be used in a texture

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
    // TODO restore and use both texture and video
    const texture = loadTexture(gl, "assets/mytexture.png");
    const textureVideo = initVideoTexture(gl);
    const video = setupVideo("assets/myvideo.mp4");
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // Flip image pixels into the bottom-to-top order that WebGL expects.

    const rotation = document.querySelector("#squareRotation");

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
            video: document.querySelector("#input_cube3d_video").checked,
            cube_translation: document.querySelector("#input_cube3d_translation").getAttribute("value").split(","),
            cube_rotationSpeed: document.querySelector("#input_cube3d_rotationSpeed").getAttribute("value").split(","),
            ambientLight: document.querySelector("#input_cube3d_ambientLight").getAttribute("value").split(","),
        };

        if (copyVideo) {
            updateTexture(gl, textureVideo, video);
        }

        let programInfo = settings.textured || settings.video ? programInfo_texture : programInfo_color;
        drawScene(gl, programInfo, buffers, cubeRotation, settings, texture, textureVideo);
        cubeRotation = (cubeRotation + deltaTime); // animation loops every 3600° deg

        rotation.textContent = (cubeRotation * (180 / Math.PI)).toFixed(1);

        if (isActive()) {
            requestAnimationFrame(render);
        }
        
    }

    requestAnimationFrame(render);

}

function isActive() {
    return document.querySelector("#button_cube3d_demo").classList.contains("active");
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
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;

    uniform highp vec3 uAmbientLight;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;

        highp vec3 directionalLightColor = vec3(1, 1, 1);
        highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

        highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

        highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
        vLighting = uAmbientLight + (directionalLightColor * directional);
    }
    `;

    const fsSource_Texture = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main() {
        highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
        gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
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
            vertexNormal: gl.getAttribLocation(shaderProgram_Texture, "aVertexNormal"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram_Texture, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram_Texture, "uModelViewMatrix"),
            normalMatrix: gl.getUniformLocation(shaderProgram_Texture, "uNormalMatrix"),
            uSampler: gl.getUniformLocation(shaderProgram_Texture, "uSampler"),
            ambientLight: gl.getUniformLocation(shaderProgram_Texture, "uAmbientLight"),
        },
    };
    return programInfo_Texture;
}

function setupVideo(url) {
    const video = document.querySelector("#video");
    let playing = false;
    let timeupdate = false;

    // need to check these events because uploading video to webgl will produce an error if no data is available yet
    video.addEventListener(
        "timeupdate", // this event fires when the currentTime attribute for the element is updated. This indicates the video is running.
        () => {
            timeupdate = true;
            checkReady();
        },
        true,
    );

    video.addEventListener(
        "playing", // this event is fired when playback is first started or restarted
        () => {
          playing = true;
          checkReady();
        },
        true,
      );

      video.src = url;
    video.play();

    function checkReady() {
        if (playing && timeupdate) {
        copyVideo = true;
        }
    }
    return video;
}

function updateTexture(gl, texture, video) {
    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      video,
    );
}