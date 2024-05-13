export async function loadGLTF(path) {
    let gltf = await loadJSON(path);

    let baseURL = new URL(path, location.href);
    console.log(gltf);
    gltf.buffers = await Promise.all(gltf.buffers.map((buffer) => {
        let url = new URL(buffer.uri, baseURL.href);
        return loadBinary(url.href);
    }))
    return gltf;
}

async function loadFile(path, callback) {
    let response = await fetch(path, {cache: "no-store"});
    if (!response.ok) {
        console.error("failed to load path " + path);
    }
    return await response[callback]();
}

async function loadBinary(path) {
    return loadFile(path, "arrayBuffer");
}

async function loadJSON(path) {
    return loadFile(path, "json");
}