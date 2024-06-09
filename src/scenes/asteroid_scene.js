import { loadTexture } from "../texture.js";
import { loadGLTF } from "../gltf_loader.js";
import Scene from "../scene.js";
import { degToRad } from "../util.js";

export async function createAsteroidScenes(gl, programInfo) {
    let sphere_gltf = await loadGLTF(gl, "assets/sphere/sphere.gltf");
    let textureInfo_sphere = {
        textureDiffuse: loadTexture(gl, "assets/asteroid.jpg"),
        textureSpecular: loadTexture(gl, "assets/asteroid.jpg"),
    };
    
    let spheres = [
        { translation: [0, 0, 0], rotation: degToRad(0), scale:          [1.0,1.0,1.0], textureInfo: textureInfo_sphere },
    ];

    let scenes = [new Scene(programInfo)];
    

    scenes.forEach(scene => {
        let node = sphere_gltf.scenes[sphere_gltf.scene].root;
        scene.addObjectsToRoot(spheres, node);
    });

    return scenes;
}