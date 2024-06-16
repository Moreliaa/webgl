export default class MeshRenderer {
    constructor(mesh) {
        this.mesh = mesh;
    }

    render(gl, programInfo, additionalInfos, node) {
        const { mesh } = this;
        programInfo.renderFunc(gl, mesh, programInfo, additionalInfos, node);
    }
}