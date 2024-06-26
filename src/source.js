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
import { createAsteroidScenes } from "./scenes/asteroid_scene.js";
import { renderDrawable, renderDrawableAsteroid, renderShadow } from "./render_functions.js";

const SHADOW_MAP_DIM = 1024;

main();


/**
 * 
 * @param {WebGL2RenderingContext} gl 
 */
function createFrameBufferShadowMap(gl) {
    
    let textureDepth = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureDepth);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, SHADOW_MAP_DIM, SHADOW_MAP_DIM, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);

    let frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, textureDepth, 0);
    gl.readBuffer(gl.NONE);
    gl.drawBuffers([gl.NONE]);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        console.error("Frame buffer incomplete");
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {frameBufShadowMap: frameBuffer, textureShadowMap: textureDepth};
}

async function main() {
    let canvas = document.querySelector("#glcanvas");

    /** @type {WebGL2RenderingContext} */
    let gl = canvas.getContext("webgl2");
    const ext = gl.getExtension("OES_texture_float");
    let {frameBufShadowMap, textureShadowMap} =createFrameBufferShadowMap(gl);


    let shadow_program = await initShaderProgram(gl, "vertex_shadowmap.vs", "fragment_empty.fs");

    let shadow_programInfo = {
        renderFunc: renderShadow,
        program: shadow_program,
        attributes: {
            position: gl.getAttribLocation(shadow_program, "aPosition"),
        },
        uniforms: {
            model: gl.getUniformLocation(shadow_program, "uModelMatrix"),
            view: gl.getUniformLocation(shadow_program, "uViewMatrix"),
            ortho: gl.getUniformLocation(shadow_program, "uOrthoMatrix"),
        }
    };

    let skybox = {
        cubeMap: loadSkybox(gl, "assets/skybox/"),
        buffers: initSkyboxBuffers(gl)
    };

    let asteroid_program = await initShaderProgram(gl, "vertex_asteroid.vs", "fragment.fs");
    let asteroid_programInfo = {
        renderFunc: renderDrawableAsteroid,
        program: asteroid_program,
        attributes: {
            position: gl.getAttribLocation(asteroid_program, "aPosition"),
            normal: gl.getAttribLocation(asteroid_program, "aNormal"),
            texture: gl.getAttribLocation(asteroid_program, "aTextureCoord"),
            modelMatrix: gl.getAttribLocation(asteroid_program, "iModelMatrix"),
            normalMatrix: gl.getAttribLocation(asteroid_program, "iNormalMatrix"),
        },

        uniforms: {
            cubeMap: gl.getUniformLocation(asteroid_program, "uCubeMap"),
            view: gl.getUniformLocation(asteroid_program, "uViewMatrix"),
            perspective: gl.getUniformLocation(asteroid_program, "uPerspectiveMatrix"),
            samplerDiffuse: gl.getUniformLocation(asteroid_program, "uSamplerDiffuse"),
            samplerSpecular: gl.getUniformLocation(asteroid_program, "uSamplerSpecular"),
            diffuseColor: gl.getUniformLocation(asteroid_program, "uMaterial.diffuseColor"),
            specularColor: gl.getUniformLocation(asteroid_program, "uMaterial.specularColor"),
            shininess: gl.getUniformLocation(asteroid_program, "uMaterial.shininess"),
            lightPosition: gl.getUniformLocation(asteroid_program, "uLight.position"),
            attenuationLinear: gl.getUniformLocation(asteroid_program, "uLight.attenuationLinear"),
            attenuationSquare: gl.getUniformLocation(asteroid_program, "uLight.attenuationSquare"),
            lightAmbient: gl.getUniformLocation(asteroid_program, "uLight.ambientColor"),
            lightDiffuse: gl.getUniformLocation(asteroid_program, "uLight.diffuseColor"),
            lightSpecular: gl.getUniformLocation(asteroid_program, "uLight.specularColor"),
            cameraPosition: gl.getUniformLocation(asteroid_program, "uCameraPosition"),
            isDirLighting: gl.getUniformLocation(asteroid_program, "uIsDirLighting"),
            dirLightDirection: gl.getUniformLocation(asteroid_program, "uDirLight.direction"),
            dirLightAmbient: gl.getUniformLocation(asteroid_program, "uDirLight.ambientColor"),
            dirLightDiffuse: gl.getUniformLocation(asteroid_program, "uDirLight.diffuseColor"),
            dirLightSpecular: gl.getUniformLocation(asteroid_program, "uDirLight.specularColor"),
            isFlashlight: gl.getUniformLocation(asteroid_program, "uIsFlashlight"),
            flashlightPosition: gl.getUniformLocation(asteroid_program, "uFlashlight.position"),
            flashlightDirection: gl.getUniformLocation(asteroid_program, "uFlashlight.direction"),
            flashlightAngleCutoffInner: gl.getUniformLocation(asteroid_program, "uFlashlight.angleCutoffInner"),
            flashlightAngleCutoffOuter: gl.getUniformLocation(asteroid_program, "uFlashlight.angleCutoffOuter"),
            flashlightAmbient: gl.getUniformLocation(asteroid_program, "uFlashlight.ambientColor"),
            flashlightDiffuse: gl.getUniformLocation(asteroid_program, "uFlashlight.diffuseColor"),
            flashlightSpecular: gl.getUniformLocation(asteroid_program, "uFlashlight.specularColor"),
            isTextured: gl.getUniformLocation(asteroid_program, "uIsTextured"),
            isPhongShading: gl.getUniformLocation(asteroid_program, "uIsPhongShading"),
            isBlinnPhongShading: gl.getUniformLocation(asteroid_program, "uIsBlinnPhongShading"),
            isReflection: gl.getUniformLocation(asteroid_program, "uIsReflection"),
        }
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
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let program = await initShaderProgram(gl, "vertex.vs", "fragment.fs");
    let drawableProgramInfo = {
        renderFunc: renderDrawable,
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
            isReflection: gl.getUniformLocation(program, "uIsReflection"),
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

    let scenes_whale = await createWhaleScenes(gl, drawableProgramInfo);
    let scenes_boxes = await createBoxesScenes(gl, drawableProgramInfo);
    let scenes_solarSystem = await createSolarScenes(gl, drawableProgramInfo);
    let scenes_blend = await createBlendScenes(gl, drawableProgramInfo);
    let scenes_asteroid = await createAsteroidScenes(gl, asteroid_programInfo);
   
    const keyboard = new Keyboard();
    const mouse = new Mouse(canvas);
    const settings = new Settings();
    const camera = new Camera(mouse);

    function checkResize() {
        if (canvas.width !== canvas.clientWidth || canvas.height != canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            doResize();
        }
    }

    function doResize() {
        gl.viewport(0, 0, canvas.width, canvas.height);
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
        let far_perspective = 100;
        mat4.perspective(perspectiveMatrix, degToRad(90), canvas.clientWidth / canvas.clientHeight, 1, far_perspective);


        // Render
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
            case settings.scenes_enum.asteroid:
                scenesToRender = scenes_asteroid;
                break;
            default:
                console.error("unknown scene " + settings.scene.toString());
        }

        // Shadow Map
        {
            let ortho_shadowMap = mat4.create();
            mat4.ortho(ortho_shadowMap, 0, 0, SHADOW_MAP_DIM, SHADOW_MAP_DIM, 0.1, far_perspective * 5);

            let dirLightPositionFake = vec3.clone(settings.dirLightDirection);
            vec3.scale(dirLightPositionFake, dirLightPositionFake, -far_perspective);
            let viewMatrixDirLight = mat4.create();
            mat4.lookAt(viewMatrixDirLight, dirLightPositionFake, [0,0,0], [0,1,0]);

            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBufShadowMap);
            gl.clear(gl.DEPTH_BUFFER_BIT);
            gl.viewport(0,0,SHADOW_MAP_DIM,SHADOW_MAP_DIM);
            for (let scene of scenesToRender) {
                scene.drawShadowMap(gl, { programInfo: shadow_programInfo, orthoMatrix: ortho_shadowMap, viewMatrix: viewMatrixDirLight});
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            doResize();
        }
    
        
        // Objects
        for (let scene of scenesToRender) {
            scene.drawScene(gl, { settings, camera, currentPointLightPosition: lightPosCurrent, perspectiveMatrix, skybox: skybox.cubeMap, textureShadowMap });
        }

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

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}