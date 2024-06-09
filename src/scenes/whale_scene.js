import { loadTexture } from "../texture.js";
import { loadGLTF } from "../gltf_loader.js";
import Scene from "../scene.js";

export async function createWhaleScenes(gl, programInfo) {
    let textureInfo_whale = {
        textureDiffuse: loadTexture(gl, "assets/killer whale/whale.png"),
        textureSpecular: loadTexture(gl, "assets/killer whale/whale.png"),
    };
    let whale_gltf = await loadGLTF(gl, "assets/killer whale/whale.CYCLES.gltf", textureInfo_whale);
    
    whale_gltf.scenes.forEach(scene => {
        scene.root.translate([0,9,0])
        scene.root.rotateSourceX(90);
        scene.root.rotateSourceZ(90);
    });
    let whale_scenes = whale_gltf.scenes.map(scene => new Scene(programInfo, scene.root));
    return whale_scenes;
}