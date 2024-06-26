import { loadPixelTexture, loadTexture } from "../texture.js";
import { loadGLTF } from "../gltf_loader.js";
import Scene from "../scene.js";
import { degToRad } from "../util.js";

export async function createBoxesScenes(gl, programInfo) {
    let cube_gltf = await loadGLTF(gl, "assets/cube/cube.gltf");
    let cube_scale = [2.0,2.0,2.0];

    let textureInfo_cubes = {
        textureDiffuse: loadTexture(gl, "assets/container2.png"),
        textureSpecular: loadTexture(gl, "assets/container2_specular.png"),
    };

    let cubes = [
        { translation: [0, 0, 0],    rotation: degToRad(0), scale:          cube_scale, textureInfo: textureInfo_cubes },
        { translation: [-10, -5, 0], rotation: degToRad(40) , scale:        cube_scale, textureInfo: textureInfo_cubes },
        { translation: [10, 5, 0],   rotation: degToRad(70) , scale:        cube_scale, textureInfo: textureInfo_cubes },
        { translation: [-23, 0, -2], rotation: degToRad(100), scale:        cube_scale, textureInfo: textureInfo_cubes },
        { translation: [0, -13, -12],  rotation: degToRad(130), scale:      cube_scale, textureInfo: textureInfo_cubes },
        { translation: [-8, 5, -13.7],    rotation: degToRad(0) , scale:    cube_scale, textureInfo: textureInfo_cubes },
        { translation: [-6, 8.5, -4.8], rotation: degToRad(40) , scale:     cube_scale, textureInfo: textureInfo_cubes },
        { translation: [-12, -8, 8.2],   rotation: degToRad(70) , scale:    cube_scale, textureInfo: textureInfo_cubes },
        { translation: [14, -14, -15.2], rotation: degToRad(100), scale:    cube_scale, textureInfo: textureInfo_cubes },
        { translation: [15, -9, -25],  rotation: degToRad(130), scale:      cube_scale, textureInfo: textureInfo_cubes },
        { translation: [-8, 5, -30.7],    rotation: degToRad(170) , scale:  cube_scale, textureInfo: textureInfo_cubes },
        { translation: [-6, 8.5, -40.8], rotation: degToRad(200) , scale:   cube_scale, textureInfo: textureInfo_cubes },
        { translation: [-12, -8, -38.2],   rotation: degToRad(230) , scale: cube_scale, textureInfo: textureInfo_cubes }, 
    ];

    let scenes_boxes = [new Scene(programInfo)];
    
    scenes_boxes.forEach(scene => {
        let cubeRoot = cube_gltf.scenes[cube_gltf.scene].root;
        scene.addObjectsToRoot(cubes, cubeRoot);
    });

    let plane_gltf = await loadGLTF(gl, "assets/plane/plane.gltf");
    let plane_scale = [100.0, 100.0, 100.0];
    let plane_color = [255, 255, 255, 255];

    let textureInfo_plane = {
        textureDiffuse: loadPixelTexture(gl, plane_color),
        textureSpecular: loadPixelTexture(gl, plane_color),
    };

    let planes = [
        { translation: [0, -2.0, 0], rotation: degToRad(90), scale: plane_scale, textureInfo: textureInfo_plane },
    ];

    scenes_boxes.forEach(scene => {
        let plane_root = plane_gltf.scenes[plane_gltf.scene].root;
        scene.addObjectsToRoot(planes, plane_root);
    });


    return scenes_boxes;
}