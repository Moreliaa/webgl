import Keyboard from "./keyboard.js";

main();

function main() {
    let canvas = document.querySelector("#glcanvas");

    // needed to fix blurriness of the image
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    /** @type {WebGLRenderingContext} */
    let gl = canvas.getContext("webgl");

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.depthFunc(gl.LESS);
    gl.enable(gl.DEPTH_TEST);

    let program = initShaderProgram(gl);
    let buffers = initBuffers(gl);
    let programInfo = {
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
        }
    };


    gl.activeTexture(gl.TEXTURE1);
    let texture = loadTexture(gl, "assets/mytexture.png");

    gl.useProgram(program);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    //gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE0);

    gl.uniform1i(programInfo.uniforms.sampler, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureBuffer);
    gl.vertexAttribPointer(programInfo.attributes.texture, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attributes.texture);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
    gl.vertexAttribPointer(programInfo.attributes.position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attributes.position);

    /*gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer);
    gl.vertexAttribPointer(programInfo.attributes.color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attributes.color);*/



    let perspectiveMatrix = mat4.create();
    mat4.perspective(perspectiveMatrix, 90, canvas.clientWidth / canvas.clientHeight, 1, 10);
    gl.uniformMatrix4fv(programInfo.uniforms.perspective, false, perspectiveMatrix);

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
    cameraPos[2] = 3.0;
    let cameraUp = vec3.create();
    cameraUp[1] = 1.0;

    const PAN_SPEED = 10;
    const keyboard = new Keyboard();

    function render(now) {
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


        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let cameraTarget = vec3.create();
        vec3.add(cameraTarget, cameraPos, cameraFront);

        let viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, cameraPos, cameraTarget, cameraUp);
        gl.uniformMatrix4fv(programInfo.uniforms.view, false, viewMatrix);

        for (let cube of cubes) {

            let modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, cube.translation);
            mat4.rotate(modelMatrix, modelMatrix, cube.rotation, [0, 0, 1]);
            gl.uniformMatrix4fv(programInfo.uniforms.model, false, modelMatrix);
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
        -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5,              // back        
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

function initShaderProgram(gl) {
    let program = gl.createProgram();

    let vShader = gl.createShader(gl.VERTEX_SHADER);
    let fShader = gl.createShader(gl.FRAGMENT_SHADER);

    /*let vSource = `
    attribute vec4 aPosition;
    attribute vec4 aColor;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uPerspectiveMatrix;

    varying highp vec4 vColor;

    void main() {
        gl_Position = uPerspectiveMatrix * uViewMatrix * uModelMatrix * aPosition;
        vColor = aColor;
    }
    `;*/

    let vSource = `
    attribute vec4 aPosition;
    attribute vec4 aColor;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uPerspectiveMatrix;

    varying highp vec4 vColor;
    varying highp vec2 vTextureCoord;

    void main() {
        gl_Position = uPerspectiveMatrix * uViewMatrix * uModelMatrix * aPosition;
        vTextureCoord = aTextureCoord;
    }
    `;

    /*let fSource = `
    varying lowp vec4 vColor;

    void main() {
        gl_FragColor = vColor;
    }
    `;*/

    let fSource = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main() {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
    `;

    gl.shaderSource(vShader, vSource);
    gl.shaderSource(fShader, fSource);

    gl.compileShader(vShader);
    gl.compileShader(fShader);

    if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(vShader);
        console.error(`Could not compile WebGL shader. \n\n${info}`);
    }

    if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(fShader);
        console.error(`Could not compile WebGL shader. \n\n${info}`);
    }

    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        console.error(`Could not compile WebGL program. \n\n${info}`);
    }

    return program;
}