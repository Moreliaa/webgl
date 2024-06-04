import Node from "./node.js";
import TRS from "./trs.js";
import MeshRenderer from "./mesh_renderer.js";

export async function loadGLTF(gl, path, textureInfo = undefined) {
    let gltf = await loadJSON(path);

    let baseURL = new URL(path, location.href);
    gltf.buffers = await Promise.all(gltf.buffers.map((buffer) => {
        let url = new URL(buffer.uri, baseURL.href);
        return loadBinary(url.href);
    }));

    setupMeshes(gl, gltf);

    const origNodes = gltf.nodes;
    gltf.nodes = gltf.nodes.map((n) => {
        const { name, skin, mesh, translation, rotation, scale } = n;
        const trs = new TRS(translation, rotation, scale);
        const node = new Node(trs, name, textureInfo);
        const realMesh = gltf.meshes[mesh];
        if (realMesh) {
            node.drawables.push(new MeshRenderer(realMesh));
        }
        return node;
    });

    function addChildren(nodes, node, childIndices) {
        childIndices.forEach(idx => {
            let child = nodes[idx];
            child.setParent(node);
        });
    }

    gltf.nodes.forEach((node, idx) => {
        let children = origNodes[idx].children;
        if (children) {
            addChildren(gltf.nodes, node, children);
        }
    });

    gltf.scenes.forEach(scene => {
        scene.root = new Node(new TRS(), scene.name);
        addChildren(gltf.nodes, scene.root, scene.nodes);
    })

    return gltf;
}

async function loadFile(path, callback) {
    let response = await fetch(path, { cache: "no-store" });
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

export function getAccessorAndWebGLBuffer(gl, gltf, accessorIndex) {
    let accessor = gltf.accessors[accessorIndex];
    let bufferView = gltf.bufferViews[accessor.bufferView];
    if (!bufferView.webglBuffer) {
        let target = bufferView.target || gl.ARRAY_BUFFER;
        let arrayBuffer = gltf.buffers[bufferView.buffer];
        let data = new Uint8Array(arrayBuffer, bufferView.byteOffset, bufferView.byteLength);
        let buffer = gl.createBuffer();
        gl.bindBuffer(target, buffer);
        gl.bufferData(target, data, gl.STATIC_DRAW);
        bufferView.webglBuffer = buffer;
    }
    return {
        accessor,
        buffer: bufferView.webglBuffer,
        stride: bufferView.stride || 0,
    };
}

const accessorTypeToNumComponentsMap = {
    'SCALAR': 1,
    'VEC2': 2,
    'VEC3': 3,
    'VEC4': 4,
    'MAT2': 4,
    'MAT3': 9,
    'MAT4': 16,
};

function accessorTypeToNumComponents(type) {
    if (!accessorTypeToNumComponentsMap[type]) {
        console.error("Missing key " + type);
    }
    return accessorTypeToNumComponentsMap[type];
}

function setupMeshes(gl, gltf) {
    gltf.meshes.forEach((mesh) => {
        mesh.primitives.forEach((primitive) => {
            const attribs = {};
            let numElements;
            for (const [attribName, index] of Object.entries(primitive.attributes)) {
                const { accessor, buffer, stride } = getAccessorAndWebGLBuffer(gl, gltf, index);
                numElements = accessor.count;
                attribs[`a_${attribName}`] = {
                    buffer,
                    type: accessor.componentType,
                    numComponents: accessorTypeToNumComponents(accessor.type),
                    stride,
                    offset: accessor.byteOffset | 0,
                };
            }

            let bufferInfo = {
                attribs,
                numElements,
            };

            if (primitive.indices !== undefined) {
                const { accessor, buffer } = getAccessorAndWebGLBuffer(gl, gltf, primitive.indices);
                bufferInfo.numElements = accessor.count;
                bufferInfo.indices = buffer;
                bufferInfo.elementType = accessor.componentType;
            }

            primitive.bufferInfo = bufferInfo;

            //primitive.material
        });
    });
}