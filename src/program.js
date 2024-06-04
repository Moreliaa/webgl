export async function initShaderProgram(gl, vertexShaderFile, fragmentShaderFile) {
    let program = gl.createProgram();

    let vShader = gl.createShader(gl.VERTEX_SHADER);
    let fShader = gl.createShader(gl.FRAGMENT_SHADER);

    let vSource = await loadShaderSource("src/shaders/" + vertexShaderFile)
    let fSource = await loadShaderSource("src/shaders/" + fragmentShaderFile);

    gl.shaderSource(vShader, vSource);
    gl.shaderSource(fShader, fSource);

    gl.compileShader(vShader);
    gl.compileShader(fShader);

    if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(vShader);
        console.error(`Could not compile WebGL shader. \n\n${info}`);
    }

    if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(fShader);
        console.error(`Could not compile WebGL shader. \n\n${info}`);
    }

    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        console.error(`Could not link WebGL program. \n\n${info}`);
    }

    return program;
}

function loadShaderSource(path) {
    return fetch(path, {cache: "no-store"}).then((res) => {
        let reader = res.body.getReader();
        let decoder = new TextDecoder();
        let shaderSource = "";
        return reader.read().then(function processText({done, value}) {
            if (value) {
                let decoded = decoder.decode(value);
                shaderSource += decoded;
            }
            if (done) {
                console.log(`Shader source ${path} loaded.`);
                return shaderSource;
            }
            return reader.read().then(processText);
        });
    }).then((body) => body);
}