import { initBuffers } from "./buffers.js";
import Keyboard from "./keyboard.js";
import Mouse from "./mouse.js";
import Settings from "./settings.js";
import Camera from "./camera.js";
import { initShaderProgram } from "./program.js";
import { degToRad } from "./util.js";
import Node from "./node.js";

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
            isFlashlight: gl.getUniformLocation(program, "uIsFlashlight"),
            flashlightPosition: gl.getUniformLocation(program, "uFlashlight.position"),
            flashlightDirection: gl.getUniformLocation(program, "uFlashlight.direction"),
            flashlightAngleCutoffInner: gl.getUniformLocation(program, "uFlashlight.angleCutoffInner"),
            flashlightAngleCutoffOuter: gl.getUniformLocation(program, "uFlashlight.angleCutoffOuter"),
            flashlightAmbient: gl.getUniformLocation(program, "uFlashlight.ambientColor"),
            flashlightDiffuse: gl.getUniformLocation(program, "uFlashlight.diffuseColor"),
            flashlightSpecular: gl.getUniformLocation(program, "uFlashlight.specularColor"),
            isTextured: gl.getUniformLocation(program, "uIsTextured"),
            isPhongShading: gl.getUniformLocation(program, "uIsPhongShading"),
            isBlinnPhongShading: gl.getUniformLocation(program, "uIsBlinnPhongShading"),
        }
    };

    let NUM_VERTICES_CUBE = 36;
    let cubes = [ // TODO cleanup
        { translation: [0, 0, 0],    rotation: degToRad(0), scale: [5.0,5.0,5.0] },
        { translation: [-10, -5, 0], rotation: degToRad(40) , scale: [5.0,5.0,5.0] },
        { translation: [10, 5, 0],   rotation: degToRad(70) , scale: [5.0,5.0,5.0] },
        { translation: [-23, 0, -2], rotation: degToRad(100), scale: [5.0,5.0,5.0] },
        { translation: [0, -13, -12],  rotation: degToRad(130), scale: [5.0,5.0,5.0] },
        { translation: [-8, 5, -13.7],    rotation: degToRad(0) , scale: [5.0,5.0,5.0] },
        { translation: [-6, 8.5, -4.8], rotation: degToRad(40) , scale: [5.0,5.0,5.0] },
        { translation: [-12, -8, 8.2],   rotation: degToRad(70) , scale: [5.0,5.0,5.0] },
        { translation: [14, -14, -15.2], rotation: degToRad(100), scale: [5.0,5.0,5.0] },
        { translation: [15, -9, -25],  rotation: degToRad(130), scale: [5.0,5.0,5.0] },
        { translation: [-8, 5, -30.7],    rotation: degToRad(170) , scale: [5.0,5.0,5.0] },
        { translation: [-6, 8.5, -40.8], rotation: degToRad(200) , scale: [5.0,5.0,5.0] },
        { translation: [-12, -8, -38.2],   rotation: degToRad(230) , scale: [5.0,5.0,5.0] }, 
    ];
    let nodes = [];
    let newcubes = [
        { translation: [0, 5, -3],    rotation: degToRad(0), scale: [5.0,5.0,5.0] },
        { translation: [0, 1, -2],    rotation: degToRad(30), scale: [1.0,1.0,1.0] },
        { translation: [0, 1, -2],    rotation: degToRad(30), scale: [1.0,1.0,1.0] },
        { translation: [0, 1, -2],    rotation: degToRad(30), scale: [1.0,1.0,1.0] },
        { translation: [0, 1, 2],    rotation: degToRad(30), scale: [1.0,1.0,1.0] },
        { translation: [0, 1, 2],    rotation: degToRad(30), scale: [1.0,1.0,1.0] },
        { translation: [0, 1, 2],    rotation: degToRad(30), scale: [1.0,1.0,1.0] },
    ];
    for (let i = 0; i < newcubes.length; i++) {
        let c = newcubes[i];
        let n = new Node(c.translation, c.rotation, c.scale);
        if (i>0) {
            n.setParent(nodes[i-1]);
        }
        nodes.push(n);
    }
    let textureDiffuse = loadTexture(gl, "assets/container2.png");
    let textureSpecular = loadTexture(gl, "assets/container2_specular.png");
    let buffers = initBuffers(gl);

    let bufferInfo_cube = [
        { index: programInfo.attributes.position, buffer: buffers.vertexBuffer, size: 3 },
        { index: programInfo.attributes.normal, buffer: buffers.normalsBuffer, size: 3 },
        { index: programInfo.attributes.texture, buffer: buffers.textureBuffer, size: 2 },
    ];

    let objectsToDraw = [];
    for (let n of nodes) {
        objectsToDraw.push({
            node: n,
            textureDiffuse: textureDiffuse,
            textureSpecular: textureSpecular,
            bufferInfo: bufferInfo_cube,
            numVertices: NUM_VERTICES_CUBE,
        });
    }

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

    let then = 0;
    let rotation = 0;

   
    const keyboard = new Keyboard();
    const mouse = new Mouse(canvas);
    const settings = new Settings();
    const camera = new Camera(mouse);

    function setAttributes(bufferInfo) {
        for (let b of bufferInfo) {
            let index = b.index;
            let buffer = b.buffer;
            let size = b.size;
            if (index === undefined || size === undefined || buffer === undefined) {
                console.error("setAttributes: incorrect input format: ", b);
                continue;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(index, size, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(index);
        }
    }

    function checkResize() {
        if (canvas.width !== canvas.clientWidth || canvas.height != canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }
    }

    function render(now) {
        checkResize();

        now = now * 0.001;
        let delta = now - then;
        then = now;
        rotation = rotation + delta;

        // point light position
        let lightSpeed = 40;
        let z = settings.lightPosition[2] * Math.cos(degToRad(rotation * lightSpeed));
        let y = settings.lightPosition[1] * Math.sin(degToRad(rotation * lightSpeed));
        let lightPosCurrent = settings.lightMovement ? vec3.fromValues(settings.lightPosition[0], y, z) : settings.lightPosition;

        let {cameraPos, cameraUp, cameraFront} = camera.handleInput(mouse, keyboard, delta);

        let cameraTarget = vec3.create();
        vec3.add(cameraTarget, cameraPos, cameraFront);

        let viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, cameraPos, cameraTarget, cameraUp);

        let perspectiveMatrix = mat4.create();
        mat4.perspective(perspectiveMatrix, 90, canvas.clientWidth / canvas.clientHeight, 1, 100);


        // Render
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Point Light
        {
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
        }

        // Objects 
        gl.useProgram(programInfo.program);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.uniformMatrix4fv(programInfo.uniforms.perspective, false, perspectiveMatrix);
        gl.uniformMatrix4fv(programInfo.uniforms.view, false, viewMatrix);
        
        gl.uniform3fv(programInfo.uniforms.diffuseColor, settings.diffuseColor);
        gl.uniform3fv(programInfo.uniforms.specularColor, settings.specularColor);
        gl.uniform1f(programInfo.uniforms.shininess, settings.shininess);

        gl.uniform3fv(programInfo.uniforms.lightAmbient, settings.lightAmbient);
        gl.uniform3fv(programInfo.uniforms.lightDiffuse, settings.lightDiffuse);
        gl.uniform3fv(programInfo.uniforms.lightSpecular, settings.lightSpecular);
        gl.uniform3fv(programInfo.uniforms.lightPosition, settings.lightPosition);
        gl.uniform1f(programInfo.uniforms.attenuationLinear, settings.attenuationLinear);
        gl.uniform1f(programInfo.uniforms.attenuationSquare, settings.attenuationSquare);

        gl.uniform3fv(programInfo.uniforms.cameraPosition, vec3.fromValues(...cameraPos));

        gl.uniform1i(programInfo.uniforms.isDirLighting, settings.isDirLighting);
        gl.uniform3fv(programInfo.uniforms.dirLightDirection, settings.dirLightDirection);
        gl.uniform3fv(programInfo.uniforms.dirLightAmbient, settings.dirLightAmbient);
        gl.uniform3fv(programInfo.uniforms.dirLightDiffuse, settings.dirLightDiffuse);
        gl.uniform3fv(programInfo.uniforms.dirLightSpecular, settings.dirLightSpecular);

        gl.uniform1i(programInfo.uniforms.isFlashlight, settings.isFlashlight);
        gl.uniform3fv(programInfo.uniforms.flashlightPosition, cameraPos);
        gl.uniform3fv(programInfo.uniforms.flashlightDirection, cameraFront);
        gl.uniform1f(programInfo.uniforms.flashlightAngleCutoffInner, Math.cos(degToRad(settings.flashlightAngleCutoffInner)));
        gl.uniform1f(programInfo.uniforms.flashlightAngleCutoffOuter, Math.cos(degToRad(settings.flashlightAngleCutoffOuter)));
        gl.uniform3fv(programInfo.uniforms.flashlightAmbient, settings.flashlightAmbient);
        gl.uniform3fv(programInfo.uniforms.flashlightDiffuse, settings.flashlightDiffuse);
        gl.uniform3fv(programInfo.uniforms.flashlightSpecular, settings.flashlightSpecular);

        gl.uniform1i(programInfo.uniforms.isTextured, settings.isTextured);
        gl.uniform1i(programInfo.uniforms.isPhongShading, settings.isPhongShading());
        gl.uniform1i(programInfo.uniforms.isBlinnPhongShading, settings.isBlinnPhongShading());

        gl.uniform1i(programInfo.uniforms.samplerDiffuse, 0);
        gl.uniform1i(programInfo.uniforms.samplerSpecular, 1);
        
        objectsToDraw[0].node.updateWorldMatrix(); // TODO just assuming index 0 === root for now
        for (let object of objectsToDraw) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, object.textureDiffuse);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, object.textureSpecular);

            setAttributes(object.bufferInfo);
        
            gl.uniformMatrix4fv(programInfo.uniforms.model, false, object.node.worldMatrix);

            let normalMatrix = mat3.create();
            mat3.fromMat4(normalMatrix, object.node.worldMatrix);
            mat3.invert(normalMatrix, normalMatrix);
            mat3.transpose(normalMatrix, normalMatrix);
            gl.uniformMatrix3fv(programInfo.uniforms.normal, false, normalMatrix);
            
            gl.drawArrays(gl.TRIANGLES, 0, object.numVertices);
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