import { loadTexture } from "../texture.js";
import { loadGLTF } from "../gltf_loader.js";
import Scene from "../scene.js";
import { degToRad } from "../util.js";

export async function createSolarScenes(gl, programInfo) {
    let sphere_gltf = await loadGLTF(gl, "assets/sphere/sphere.gltf");
    // intentionally no specular for these
    let textureInfo_sun = {
        textureDiffuse: loadTexture(gl, "assets/sun.jpg"),
    };

    let textureInfo_earth = {
        textureDiffuse: loadTexture(gl, "assets/earth.jpg"),
    };

    let textureInfo_moon = {
        textureDiffuse: loadTexture(gl, "assets/moon.png"),
    };

    let spheres_solarSystem = [ // scaling also depends on parent node
        { id: "sun", translation: [0, 0, -5],    rotation: degToRad(0), scale: [5.0,5.0,5.0], textureInfo: textureInfo_sun },
        { id: "earth", translation: [0, 4, 0],    rotation: degToRad(0), scale: [0.5,0.5,0.5], textureInfo: textureInfo_earth },
        { id: "moon", translation: [0, 2, 0],    rotation: degToRad(0), scale: [0.3,0.3,0.3], textureInfo: textureInfo_moon },
    ];

    let scenes_solarSystem = [new Scene(programInfo)];
    scenes_solarSystem.forEach(scene => {
        let sphereRoot = sphere_gltf.scenes[sphere_gltf.scene].root;
        scene.addObjectHierarchy(spheres_solarSystem, sphereRoot);
    });
    return scenes_solarSystem;
}