import { loadTexture } from "../texture.js";
import { loadGLTF } from "../gltf_loader.js";
import Scene from "../scene.js";
import { degToRad } from "../util.js";

export async function createBlendScenes(gl) {
    let plane_gltf = await loadGLTF(gl, "assets/plane/plane.gltf");
    let cube_gltf = await loadGLTF(gl, "assets/cube/cube.gltf");
    let textureInfo_cubes = {
        textureDiffuse: loadTexture(gl, "assets/container2.png"),
        textureSpecular: loadTexture(gl, "assets/container2_specular.png"),
    };
    let cube_scale = [2.0,2.0,2.0];
    let yOffset = 5;
    let cubes = [
        { translation: [0, yOffset, 0],    rotation: degToRad(0), scale:          cube_scale, textureInfo: textureInfo_cubes },
    ];
    let textureInfo_window = {
        textureDiffuse: loadTexture(gl, "assets/blending_transparent_window.png"),
    };
    let grass_planes = [
        { translation: [7.1, yOffset + 5, 0],    rotation: degToRad(45), scale:          cube_scale, textureInfo: textureInfo_window },
        { translation: [5.1, yOffset + 5, 0],    rotation: degToRad(45), scale:          cube_scale, textureInfo: textureInfo_window },
        { translation: [5.1, yOffset, 0],    rotation: degToRad(0), scale:          cube_scale, textureInfo: textureInfo_window },
        { translation: [6.1, yOffset, 0],    rotation: degToRad(0), scale:          cube_scale, textureInfo: textureInfo_window },
        { translation: [7.1, yOffset, 0],    rotation: degToRad(0), scale:          cube_scale, textureInfo: textureInfo_window },
        { translation: [8.1, yOffset, 0],    rotation: degToRad(0), scale:          cube_scale, textureInfo: textureInfo_window },
        { translation: [9.1, yOffset, 0],    rotation: degToRad(0), scale:          cube_scale, textureInfo: textureInfo_window },
        { translation: [10.1, yOffset, 0],    rotation: degToRad(0), scale:          cube_scale, textureInfo: textureInfo_window },
    ];

    let scenes_blend = [new Scene()];
    
    scenes_blend.forEach(scene => {
        scene.rootNode.rotateSourceY(-90);
    });
    scenes_blend.forEach(scene => {
        let grass_node = plane_gltf.scenes[plane_gltf.scene].root;
        let cube_node = cube_gltf.scenes[cube_gltf.scene].root;
        scene.addObjectsToRoot(cubes, cube_node);
        scene.addObjectsToRoot(grass_planes, grass_node);
    });

    return scenes_blend;
}