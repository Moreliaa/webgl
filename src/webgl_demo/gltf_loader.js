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

  export function setupMeshes(gl, gltf) {
      // setup meshes
      gltf.meshes.forEach((mesh) => {
        mesh.primitives.forEach((primitive) => {
          const attribs = {};
          let numElements;
          for (const [attribName, index] of Object.entries(primitive.attributes)) {
            const {accessor, buffer, stride} = getAccessorAndWebGLBuffer(gl, gltf, index);
            numElements = accessor.count;
            attribs[`a_${attribName}`] = {
              buffer,
              type: accessor.componentType,
              numComponents: accessorTypeToNumComponents(accessor.type),
              stride,
              offset: accessor.byteOffset | 0,
            };
          }
       
          const bufferInfo = {
            attribs,
            numElements,
          };
       
          if (primitive.indices !== undefined) {
            const {accessor, buffer} = getAccessorAndWebGLBuffer(gl, gltf, primitive.indices);
            bufferInfo.numElements = accessor.count;
            bufferInfo.indices = buffer;
            bufferInfo.elementType = accessor.componentType;
          }
       
          primitive.bufferInfo = bufferInfo;
       
          //primitive.material
        });
      });
  }