import Keyboard from "./keyboard.js";
import { initShaderProgram } from "./program.js";

main();

async function main() {
    let canvas = document.querySelector("#glcanvas");

    /** @type {WebGLRenderingContext} */
    let gl = canvas.getContext("webgl");

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.depthFunc(gl.LESS);
    gl.enable(gl.DEPTH_TEST);

    let program = await initShaderProgram(gl, "vertex.vs", "fragment.fs");
    let programInfo = {
        program: program,
        attributes: {
            position: gl.getAttribLocation(program, "aPosition"),
            color: gl.getAttribLocation(program, "aColor"),
            texture: gl.getAttribLocation(program, "aTextureCoord"),
        },

        uniforms: {
            model: gl.getUniformLocation(program, "uModelMatrix"),
            view: gl.getUniformLocation(program, "uViewMatrix"),
            perspective: gl.getUniformLocation(program, "uPerspectiveMatrix"),
            sampler: gl.getUniformLocation(program, "uSampler"),
            ambientColor: gl.getUniformLocation(program, "uAmbientColor"),
        }
    };

    let program_pointLight = await initShaderProgram(gl, "vertex_point-light.vs", "fragment_point-light.fs");
    let programInfo_pointLight = {
        program: program_pointLight,
        attributes: {
            position: gl.getAttribLocation(program_pointLight, "aPosition"),
        },

        uniforms: {
            model: gl.getUniformLocation(program_pointLight, "uModelMatrix"),
            view: gl.getUniformLocation(program_pointLight, "uViewMatrix"),
            perspective: gl.getUniformLocation(program_pointLight, "uPerspectiveMatrix"),
            lightColor: gl.getUniformLocation(program_pointLight, "uLightColor")
        }
    };

    let buffers = initBuffers(gl);
    let texture = loadTexture(gl, "assets/mytexture.png");
    

    

    /*let perspectiveMatrix = mat4.create();
    mat4.ortho(perspectiveMatrix, -3, 3, -3, 3, 1, 10);
    gl.uniformMatrix4fv(programInfo.uniforms.perspective, false, perspectiveMatrix);*/

    function degToRad(deg) {
        return deg * Math.PI / 180;
    }

    let cubes = [
        { translation: [0, 0, 0], rotation: degToRad(0) },
        { translation: [-2, -1, 0], rotation: degToRad(40) },
        { translation: [2, 1, 0], rotation: degToRad(70) },
        //{translation: [0,0,-2], rotation: degToRad(30)},
        //{translation: [0,0,2], rotation: degToRad(120)},
    ];

    let pointLights = [
        {translation: [0,3,3]}
    ]

    let then = 0;
    let rotation = 0;

    let yaw = -90;
    let pitch = 0;
    let pitch_max = 89;
    let pitch_min = -89;
    let mouseSensitivity = 0.5;
    
    canvas.onclick = captureMouse;

    async function captureMouse(e) {
        await canvas.requestPointerLock({
            unadjustedMovement: true, // turn off mouse acceleration
        });
    }

    document.onmousemove = (e) => {
        if (document.pointerLockElement !== canvas) {
            return;
        }
        yaw += e.movementX * mouseSensitivity;
        //yaw = yaw % 360;
        pitch -= e.movementY * mouseSensitivity;
        if (pitch > pitch_max) {
            pitch = pitch_max;
        } else if (pitch < pitch_min) {
            pitch = pitch_min;
        }
    }


    let cameraPos = vec3.create();
    cameraPos[2] = 5.0;
    let cameraUp = vec3.create();
    cameraUp[1] = 2.0;

    const PAN_SPEED = 10;
    const keyboard = new Keyboard();

    function render(now) {
        // check resize
        if (canvas.width !== canvas.clientWidth || canvas.height != canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }


        now = now * 0.001;
        let delta = now - then;
        then = now;
        rotation = rotation + delta;
        let cameraFront = vec3.create();
        let yaw_rad = degToRad(yaw);
        let pitch_rad = degToRad(pitch);
        cameraFront[0] = Math.cos(yaw_rad) * Math.cos(pitch_rad);
        cameraFront[1] = Math.sin(pitch_rad);
        cameraFront[2] = Math.sin(yaw_rad) * Math.cos(pitch_rad);
        vec3.normalize(cameraFront, cameraFront);

// Controls
        if (keyboard.keys.back && !keyboard.keys.forward) {
            let offset = vec3.create();
            vec3.scale(offset, cameraFront, delta * PAN_SPEED);
            vec3.sub(cameraPos, cameraPos, offset);
        } else if (keyboard.keys.forward && !keyboard.keys.back) {
            let offset = vec3.create();
            vec3.scale(offset, cameraFront, delta * PAN_SPEED);
            vec3.add(cameraPos, cameraPos, offset)
        }

        if (keyboard.keys.left && !keyboard.keys.right) {
            let offset = vec3.create();
            vec3.cross(offset, cameraFront, cameraUp);
            vec3.scale(offset, offset, delta * PAN_SPEED);
            vec3.sub(cameraPos, cameraPos, offset);
        } else if (keyboard.keys.right && !keyboard.keys.left) {
            let offset = vec3.create();
            vec3.cross(offset, cameraFront, cameraUp);
            vec3.scale(offset, offset, delta * PAN_SPEED);
            vec3.add(cameraPos, cameraPos, offset);
        }

        if (keyboard.keys.up && !keyboard.keys.down) {
            let offset = vec3.create();
            vec3.scale(offset, cameraUp, delta * PAN_SPEED);
            vec3.add(cameraPos, cameraPos, offset);
        } else if (!keyboard.keys.up && keyboard.keys.down) {
            let offset = vec3.create();
            vec3.scale(offset, cameraUp, delta * PAN_SPEED);
            vec3.sub(cameraPos, cameraPos, offset);
        }

// Render
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let cameraTarget = vec3.create();
        vec3.add(cameraTarget, cameraPos, cameraFront);

        let viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, cameraPos, cameraTarget, cameraUp);

        let perspectiveMatrix = mat4.create();
        mat4.perspective(perspectiveMatrix, 90, canvas.clientWidth / canvas.clientHeight, 1, 10);

        gl.useProgram(programInfo.program);
        gl.activeTexture(gl.TEXTURE0);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.uniform1i(programInfo.uniforms.sampler, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureBuffer);
        gl.vertexAttribPointer(programInfo.attributes.texture, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attributes.texture);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
        gl.vertexAttribPointer(programInfo.attributes.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attributes.position);

        gl.uniformMatrix4fv(programInfo.uniforms.perspective, false, perspectiveMatrix);
        gl.uniformMatrix4fv(programInfo.uniforms.view, false, viewMatrix);

        let ambientColor = vec4.fromValues(0.7, 0.5, 0.3, 1.0);
        gl.uniform4fv(programInfo.uniforms.ambientColor, ambientColor);

        for (let cube of cubes) {
            let modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, cube.translation);
            mat4.rotate(modelMatrix, modelMatrix, cube.rotation, [0, 0, 1]);
            gl.uniformMatrix4fv(programInfo.uniforms.model, false, modelMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, 36);
        }

        // Lights
        gl.useProgram(programInfo_pointLight.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
        gl.vertexAttribPointer(programInfo_pointLight.attributes.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo_pointLight.attributes.position);

        gl.uniformMatrix4fv(programInfo_pointLight.uniforms.perspective, false, perspectiveMatrix);
        gl.uniformMatrix4fv(programInfo_pointLight.uniforms.view, false, viewMatrix);

        let lightColor = vec4.fromValues(1.0, 1.0, 0.5, 1.0);
        gl.uniform4fv(programInfo_pointLight.uniforms.lightColor, lightColor);

        for (let pointLight of pointLights) {
            let modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, pointLight.translation);
            mat4.scale(modelMatrix,modelMatrix, [0.5, 0.5, 0.5]);
            gl.uniformMatrix4fv(programInfo_pointLight.uniforms.model, false, modelMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, 36);
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

function loadTexture(gl, path) {
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
        gl.generateMipmap(gl.TEXTURE_2D);

    }
    image.src = path;

    return texture;
}

function initBuffers(gl) {
    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let vertices = [ // x y z
        -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, // front
         0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5,-0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,              // back        
        -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,// top
        -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5,// bottom
        -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5,// left
        0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5,// right
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let colors = [
        1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, // front - red
        0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, // back - green
        0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, // top - blue
        1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, // bottom - purple
        1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, // left - yellow
        0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, // right - cyan
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    let textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    let textureCoordinates = [
        // Front
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
        // Back
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
        // Top
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
        // Bottom
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
        // Right
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
        // Left
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    return { vertexBuffer, colorBuffer, textureBuffer };
}