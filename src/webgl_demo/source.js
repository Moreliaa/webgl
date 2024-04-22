import { initBuffers } from "./buffers.js";
import Keyboard from "./keyboard.js";
import Settings from "./settings.js";
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
    gl.enable(gl.CULL_FACE);

    let program = await initShaderProgram(gl, "vertex.vs", "fragment.fs");
    let programInfo = {
        program: program,
        attributes: {
            position: gl.getAttribLocation(program, "aPosition"),
            normal: gl.getAttribLocation(program, "aNormal"),
            color: gl.getAttribLocation(program, "aColor"),
            texture: gl.getAttribLocation(program, "aTextureCoord"),
        },

        uniforms: {
            model: gl.getUniformLocation(program, "uModelMatrix"),
            normal: gl.getUniformLocation(program, "uNormalMatrix"),
            view: gl.getUniformLocation(program, "uViewMatrix"),
            perspective: gl.getUniformLocation(program, "uPerspectiveMatrix"),
            samplerDiffuse: gl.getUniformLocation(program, "uSamplerDiffuse"),
            samplerSpecular: gl.getUniformLocation(program, "uSamplerSpecular"),
            diffuseColor: gl.getUniformLocation(program, "uMaterial.diffuseColor"),
            specularColor: gl.getUniformLocation(program, "uMaterial.specularColor"),
            shininess: gl.getUniformLocation(program, "uMaterial.shininess"),
            lightPosition: gl.getUniformLocation(program, "uLight.position"),
            attenuationLinear: gl.getUniformLocation(program, "uLight.attenuationLinear"),
            attenuationSquare: gl.getUniformLocation(program, "uLight.attenuationSquare"),
            lightAmbient: gl.getUniformLocation(program, "uLight.ambientColor"),
            lightDiffuse: gl.getUniformLocation(program, "uLight.diffuseColor"),
            lightSpecular: gl.getUniformLocation(program, "uLight.specularColor"),
            cameraPosition: gl.getUniformLocation(program, "uCameraPosition"),
            isDirLighting: gl.getUniformLocation(program, "uIsDirLighting"),
            dirLightDirection: gl.getUniformLocation(program, "uDirLight.direction"),
            dirLightAmbient: gl.getUniformLocation(program, "uDirLight.ambientColor"),
            dirLightDiffuse: gl.getUniformLocation(program, "uDirLight.diffuseColor"),
            dirLightSpecular: gl.getUniformLocation(program, "uDirLight.specularColor"),
            isTextured: gl.getUniformLocation(program, "uIsTextured"),
            isPhongShading: gl.getUniformLocation(program, "uIsPhongShading"),
            isBlinnPhongShading: gl.getUniformLocation(program, "uIsBlinnPhongShading"),
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
            lightAmbient: gl.getUniformLocation(program_pointLight, "uLight.ambientColor"),
            lightDiffuse: gl.getUniformLocation(program_pointLight, "uLight.diffuseColor"),
            lightSpecular: gl.getUniformLocation(program_pointLight, "uLight.specularColor"),
        }
    };

    let buffers = initBuffers(gl);
    let textureDiffuse = loadTexture(gl, "assets/container2.png");
    let textureSpecular = loadTexture(gl, "assets/container2_specular.png");
    

    

    /*let perspectiveMatrix = mat4.create();
    mat4.ortho(perspectiveMatrix, -3, 3, -3, 3, 1, 10);
    gl.uniformMatrix4fv(programInfo.uniforms.perspective, false, perspectiveMatrix);*/

    function degToRad(deg) {
        return deg * Math.PI / 180;
    }

    let cubes = [
        { translation: [0, 0, 0],    rotation: degToRad(0) },
        { translation: [-10, -5, 0], rotation: degToRad(40) },
        { translation: [10, 5, 0],   rotation: degToRad(70) },
        { translation: [-23, 0, -2], rotation: degToRad(100)},
        { translation: [0, -13, -12],  rotation: degToRad(130)},
        { translation: [-8, 5, -13.7],    rotation: degToRad(0) },
        { translation: [-6, 8.5, -4.8], rotation: degToRad(40) },
        { translation: [-12, -8, 8.2],   rotation: degToRad(70) },
        { translation: [14, -14, -15.2], rotation: degToRad(100)},
        { translation: [15, -9, -25],  rotation: degToRad(130)},
        { translation: [-8, 5, -30.7],    rotation: degToRad(170) },
        { translation: [-6, 8.5, -40.8], rotation: degToRad(200) },
        { translation: [-12, -8, -38.2],   rotation: degToRad(230) },
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
    cameraPos[2] = 8.0;
    cameraPos[1] = 8.0;
    let cameraUp = vec3.create();
    cameraUp[1] = 1.0;

    const PAN_SPEED = 10;
    const keyboard = new Keyboard();
    const settings = new Settings();

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

        // light position
        let lightSpeed = 40;
        let z = settings.lightPosition[2] * Math.cos(degToRad(rotation * lightSpeed));
        let y = settings.lightPosition[1] * Math.sin(degToRad(rotation * lightSpeed));
        let lightPosCurrent = settings.lightMovement ? vec3.fromValues(settings.lightPosition[0], y, z) : settings.lightPosition;

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

        // Settings
        let diffuseColor = settings.diffuseColor;
        let specularColor = settings.specularColor;
        let shininess = settings.shininess;

        // Render
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let cameraTarget = vec3.create();
        vec3.add(cameraTarget, cameraPos, cameraFront);

        let viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, cameraPos, cameraTarget, cameraUp);

        let perspectiveMatrix = mat4.create();
        mat4.perspective(perspectiveMatrix, 90, canvas.clientWidth / canvas.clientHeight, 1, 100);

        // Lights
        gl.useProgram(programInfo_pointLight.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
        gl.vertexAttribPointer(programInfo_pointLight.attributes.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo_pointLight.attributes.position);

        gl.uniformMatrix4fv(programInfo_pointLight.uniforms.perspective, false, perspectiveMatrix);
        gl.uniformMatrix4fv(programInfo_pointLight.uniforms.view, false, viewMatrix);

        gl.uniform3fv(programInfo_pointLight.uniforms.lightAmbient, settings.lightAmbient);
        gl.uniform3fv(programInfo_pointLight.uniforms.lightDiffuse, settings.lightDiffuse);
        gl.uniform3fv(programInfo_pointLight.uniforms.lightSpecular, settings.lightSpecular);
       

        let modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, lightPosCurrent);
        mat4.scale(modelMatrix,modelMatrix, [0.5, 0.5, 0.5]);
        gl.uniformMatrix4fv(programInfo_pointLight.uniforms.model, false, modelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, 36);

// Cubes 
        gl.useProgram(programInfo.program);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureDiffuse);
        gl.uniform1i(programInfo.uniforms.samplerDiffuse, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textureSpecular);
        gl.uniform1i(programInfo.uniforms.samplerSpecular, 1);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureBuffer);
        gl.vertexAttribPointer(programInfo.attributes.texture, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attributes.texture);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
        gl.vertexAttribPointer(programInfo.attributes.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attributes.position);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalsBuffer);
        gl.vertexAttribPointer(programInfo.attributes.normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attributes.normal);

        gl.uniformMatrix4fv(programInfo.uniforms.perspective, false, perspectiveMatrix);
        gl.uniformMatrix4fv(programInfo.uniforms.view, false, viewMatrix);
        
        gl.uniform3fv(programInfo.uniforms.diffuseColor, diffuseColor);
        gl.uniform3fv(programInfo.uniforms.specularColor, specularColor);
        gl.uniform1f(programInfo.uniforms.shininess, shininess);

        gl.uniform1f(programInfo.uniforms.attenuationLinear, settings.attenuationLinear);
        gl.uniform1f(programInfo.uniforms.attenuationSquare, settings.attenuationSquare);

        gl.uniform3fv(programInfo.uniforms.lightAmbient, settings.lightAmbient);
        gl.uniform3fv(programInfo.uniforms.lightDiffuse, settings.lightDiffuse);
        gl.uniform3fv(programInfo.uniforms.lightSpecular, settings.lightSpecular);
        let lightPosition = lightPosCurrent;
        let lightPositionAsVec = vec3.fromValues(...lightPosition);
        gl.uniform3fv(programInfo.uniforms.lightPosition, lightPositionAsVec);
        gl.uniform3fv(programInfo.uniforms.cameraPosition, vec3.fromValues(...cameraPos));

        // Directional light
        gl.uniform1i(programInfo.uniforms.isDirLighting, settings.isDirLighting);
        gl.uniform3fv(programInfo.uniforms.dirLightDirection, settings.dirLightDirection);
        gl.uniform3fv(programInfo.uniforms.dirLightAmbient, settings.dirLightAmbient);
        gl.uniform3fv(programInfo.uniforms.dirLightDiffuse, settings.dirLightDiffuse);
        gl.uniform3fv(programInfo.uniforms.dirLightSpecular, settings.dirLightSpecular);

        gl.uniform1i(programInfo.uniforms.isTextured, settings.isTextured);
        gl.uniform1i(programInfo.uniforms.isPhongShading, settings.isPhongShading());
        gl.uniform1i(programInfo.uniforms.isBlinnPhongShading, settings.isBlinnPhongShading());

        for (let cube of cubes) {
            let modelMatrix = mat4.create();
            mat4.translate(modelMatrix, modelMatrix, cube.translation);
            mat4.rotate(modelMatrix, modelMatrix, cube.rotation, [0, 0, 1]);
            mat4.scale(modelMatrix, modelMatrix, [5,5,5]);
            gl.uniformMatrix4fv(programInfo.uniforms.model, false, modelMatrix);

            let normalMatrix = mat3.create();
            mat3.fromMat4(normalMatrix, modelMatrix);
            mat3.invert(normalMatrix, normalMatrix);
            mat3.transpose(normalMatrix, normalMatrix);
            gl.uniformMatrix3fv(programInfo.uniforms.normal, false, normalMatrix);
            
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

function isPow2(val) {
    return val & (val - 1) === 0;
}