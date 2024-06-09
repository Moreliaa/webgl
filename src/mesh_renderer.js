export default class MeshRenderer {
    constructor(mesh) {
        this.mesh = mesh;
    }

    render(gl, programInfo, settings, camera, currentPointLightPosition, perspectiveMatrix, skybox, node) {
        const { mesh } = this;
        programInfo.renderFunc(gl, mesh, programInfo, settings, camera, currentPointLightPosition, perspectiveMatrix, skybox, node);
    }
}