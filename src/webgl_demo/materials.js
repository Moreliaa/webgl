export default function getDefaultMaterials() {
    // http://devernay.free.fr/cours/opengl/materials.html
    const shininessFactor =  128;
    let mats = [
        {
            name: "White",
            diffuse: vec3.fromValues(1.0,1.0,1.0),
            specular: vec3.fromValues(1.0,1.0,1.0),
            shininess: 1 * shininessFactor,
        },
        {
            name: "Emerald",
            diffuse: vec3.fromValues(0.075680,0.61424,0.07568),
            specular: vec3.fromValues(0.633,0.727811,0.633),
            shininess: 0.6 * shininessFactor,
        },
        {
            name: "Gold",
            diffuse: vec3.fromValues(0.75164,0.60648,0.22648),
            specular: vec3.fromValues(0.628281,0.555802,0.366065),
            shininess: 0.4 * shininessFactor,
        },
    ];
    return mats;
}