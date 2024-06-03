import { initBuffers, initSkyboxBuffers } from "./buffers.js";
import Keyboard from "./keyboard.js";
import Mouse from "./mouse.js";
import Settings from "./settings.js";
import Camera from "./camera.js";
import { initShaderProgram } from "./program.js";
import { degToRad } from "./util.js";
import { createWhaleScenes } from "./scenes/whale_scene.js";
import { createBoxesScenes } from "./scenes/boxes_scene.js";
import { createSolarScenes } from "./scenes/solar_scene.js";
import { createBlendScenes } from "./scenes/blend_scene.js";
import { loadSkybox } from "./texture.js";

main();

async function main() {
    let canvas = document.querySelector("#glcanvas");

    /** @type {WebGL2RenderingContext} */
    let gl = canvas.getContext("webgl2");
    let skybox = {
        cubeMap: loadSkybox(gl, "assets/skybox/"),
        buffers: initSkyboxBuffers(gl)
    };

    let skybox_program = await initShaderProgram(gl, "vertex_skybox.vs", "fragment_skybox.fs");
    let skybox_programInfo = {
        program: skybox_program,
        attributes: {
            position: gl.getAttribLocation(skybox_program, "aPosition"),
        },
        uniforms: {
            view: gl.getUniformLocation(skybox_program, "uViewMatrix"),
            perspective: gl.getUniformLocation(skybox_program, "uPerspectiveMatrix"),
            sampler: gl.getUniformLocation(skybox_program, "uCubeMap"),
        },
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.depthFunc(gl.LESS);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let program = await initShaderProgram(gl, "vertex.vs", "fragment.fs");
    let drawableProgramInfo = {
        program: program,
        attributes: {
            position: gl.getAttribLocation(program, "aPosition"),
            normal: gl.getAttribLocation(program, "aNormal"),
            texture: gl.getAttribLocation(program, "aTextureCoord"),
        },

        uniforms: {
            cubeMap: gl.getUniformLocation(program, "uCubeMap"),
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
    
    let buffers = initBuffers(gl); // used only for point light now

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

    let scenes_whale = await createWhaleScenes(gl);
    let scenes_boxes = await createBoxesScenes(gl);
    let scenes_solarSystem = await createSolarScenes(gl);
    let scenes_blend = await createBlendScenes(gl);
   
    const keyboard = new Keyboard();
    const mouse = new Mouse(canvas);
    const settings = new Settings();
    const camera = new Camera(mouse);

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

        // scene updates
        scenes_solarSystem.forEach(scene => {
            scene.updateNodeRotationZ("earth", rotation);
            scene.updateNodeRotationZ("moon", rotation * 5 );
        });
    
        let lightSpeed = 40;
        let z = settings.lightPosition[2] * Math.cos(degToRad(rotation * lightSpeed)) + settings.lightPosition[1] * Math.sin(degToRad(rotation * lightSpeed));
        let y = settings.lightPosition[1] * Math.cos(degToRad(rotation * lightSpeed)) + settings.lightPosition[2] * Math.sin(degToRad(rotation * lightSpeed));
        let lightPosCurrent = settings.lightMovement ? vec3.fromValues(settings.lightPosition[0], y, z) : settings.lightPosition;

        camera.handleInput(mouse, keyboard, delta);

        let perspectiveMatrix = mat4.create();
        mat4.perspective(perspectiveMatrix, degToRad(90), canvas.clientWidth / canvas.clientHeight, 1, 100);


        // Render
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Skybox
        gl.depthMask(false);
        gl.useProgram(skybox_programInfo.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, skybox.buffers.vertexBuffer);
        gl.vertexAttribPointer(skybox_programInfo.attributes.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(skybox_programInfo.attributes.position);

        gl.uniformMatrix4fv(skybox_programInfo.uniforms.perspective, false, perspectiveMatrix);
        gl.uniformMatrix4fv(skybox_programInfo.uniforms.view, false, camera.viewMatrix_onlyRotation);

        gl.uniform1i(skybox_programInfo.uniforms.sampler, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox.cubeMap);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
        gl.depthMask(true);

        // Point Light
        {
            gl.useProgram(programInfo_pointLight.program);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
            gl.vertexAttribPointer(programInfo_pointLight.attributes.position, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo_pointLight.attributes.position);

            gl.uniformMatrix4fv(programInfo_pointLight.uniforms.perspective, false, perspectiveMatrix);
            gl.uniformMatrix4fv(programInfo_pointLight.uniforms.view, false, camera.viewMatrix);

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
        let scenesToRender = [];
        switch (settings.scene) {
            case settings.scenes_enum.whale:
                scenesToRender = scenes_whale;
                break;
            case settings.scenes_enum.boxes:
                scenesToRender = scenes_boxes;
                break;
            case settings.scenes_enum.solar:
                scenesToRender = scenes_solarSystem;
                break;
            case settings.scenes_enum.blend:
                scenesToRender = scenes_blend;
                break;
            default:
                console.error("unknown scene " + settings.scene.toString());
        }

        for (let scene of scenesToRender) {
            scene.drawScene(gl, drawableProgramInfo, settings, camera, lightPosCurrent, perspectiveMatrix);
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}