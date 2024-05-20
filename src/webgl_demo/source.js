import { initBuffers } from "./buffers.js";
import Keyboard from "./keyboard.js";
import Mouse from "./mouse.js";
import Settings from "./settings.js";
import Camera from "./camera.js";
import { initShaderProgram } from "./program.js";
import { degToRad } from "./util.js";
import Scene from "./scene.js";
import { loadGLTF } from "./gltf_loader.js";

main();

async function main() {
    let canvas = document.querySelector("#glcanvas");

    /** @type {WebGLRenderingContext} */
    let gl = canvas.getContext("webgl");

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let whale_gltf = await loadGLTF(gl, "assets/killer whale/whale.CYCLES.gltf");
    let commonDrawInfo_whale = {
        textureDiffuse: loadTexture(gl, "assets/killer whale/whale.png"),
        textureSpecular: loadTexture(gl, "assets/killer whale/whale.png"),
    };
    let whale_scenes = whale_gltf.scenes.map(scene => new Scene(scene.root, commonDrawInfo_whale));
    
    gl.depthFunc(gl.LESS);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    let program = await initShaderProgram(gl, "vertex.vs", "fragment.fs");
    let drawableProgramInfo = {
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
    let cubes = [
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
    
    

    
    let buffers = initBuffers(gl);

    let bufferInfo_cube = [
        { index: drawableProgramInfo.attributes.position, buffer: buffers.vertexBuffer, size: 3 },
        { index: drawableProgramInfo.attributes.normal, buffer: buffers.normalsBuffer, size: 3 },
        { index: drawableProgramInfo.attributes.texture, buffer: buffers.textureBuffer, size: 2 },
    ];

    let commonDrawInfo_cubes = {
        programInfo: drawableProgramInfo,
        textureDiffuse: loadTexture(gl, "assets/container2.png"),
        textureSpecular: loadTexture(gl, "assets/container2_specular.png"),
        bufferInfo: bufferInfo_cube,
        numVertices: NUM_VERTICES_CUBE,
    };

    let cubes_solarSystem = [
        { id: "sun", translation: [0, 0, -5],    rotation: degToRad(0), scale: [5.0,5.0,5.0] },
        { id: "earth", translation: [0, 8, 0],    rotation: degToRad(0), scale: [1.0,1.0,1.0] },
        { id: "moon", translation: [0, 2, 0],    rotation: degToRad(0), scale: [1.0,1.0,1.0] },
    ];


    let cube_gltf = await loadGLTF(gl, "/assets/cube/cube.gltf");
    console.log(cube_gltf)

    let scenes_solarSystem = [new Scene(undefined, commonDrawInfo_cubes)];
    scenes_solarSystem.forEach(scene => {
        let cubeRoot = cube_gltf.scenes[cube_gltf.scene].root;
        scene.addObjectHierarchy(cubes_solarSystem, cubeRoot);
    })

    let scenes_boxes = [new Scene(undefined, commonDrawInfo_cubes)];
    scenes_boxes.forEach(scene => {
        let cubeRoot = cube_gltf.scenes[cube_gltf.scene].root;
        scene.addObjectHierarchy(cubes, cubeRoot);
    });

    

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
            scene.updateNodeRotationZ("moon", rotation * 5);
        });
    
        let lightSpeed = 40;
        let z = settings.lightPosition[2] * Math.cos(degToRad(rotation * lightSpeed));
        let y = settings.lightPosition[1] * Math.sin(degToRad(rotation * lightSpeed));
        let lightPosCurrent = settings.lightMovement ? vec3.fromValues(settings.lightPosition[0], y, z) : settings.lightPosition;

        camera.handleInput(mouse, keyboard, delta);

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
                scenesToRender = whale_scenes;
                break;
            case settings.scenes_enum.boxes:
                scenesToRender = scenes_boxes;
                break;
            case settings.scenes_enum.solar:
                scenesToRender = scenes_solarSystem;
                break;
            default:
                console.error("unknown scene " + settings.scene);
        }

        for (let scene of scenesToRender) {
            scene.drawScene(gl, drawableProgramInfo, settings, camera, lightPosCurrent, perspectiveMatrix);
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