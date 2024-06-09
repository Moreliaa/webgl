import Node from "./node.js";
import TRS from "./trs.js";

export default class Scene {
    constructor(programInfo, rootNode = undefined) {
        this.rootNode = rootNode || new Node(new TRS(), 0);
        this.programInfo = programInfo;
    }

    updateNodeRotationZ(nodeId, rotation) {
        function rotateNode(node) {
            if (node.id === nodeId) {
                node.rotateZ(rotation);
            }
        }

        this.rootNode.traverse(rotateNode);
    }

    /**
     * Add nodes where all of them depend on the root node.
     */
    addObjectsToRoot(objects, node) {
        for (let i = 0; i < objects.length; i++) {
            let n = buildNodeFromObjectData(objects[i], node);
            n.setParent(this.rootNode);
        }
    }

    /**
     * Add node with each node being a child of the prior node. 
     */
    addObjectHierarchy(objects, node) {
        let nodes = [];
        for (let i = 0; i < objects.length; i++) {
            let n = buildNodeFromObjectData(objects[i], node);
            if (i === 0) {
                n.setParent(this.rootNode);
            } else {
                n.setParent(nodes[i - 1]);
            }
            nodes.push(n);
        }
    }

    drawScene(gl, settings, camera, lightPosCurrent, perspectiveMatrix, skybox) {
        let programInfo = this.programInfo;
        function renderNode(node) {
            for (let drawable of node.drawables) {
                drawable.render(gl, programInfo, settings, camera, lightPosCurrent, perspectiveMatrix, skybox, node);
            }
        }

        this.rootNode.updateWorldMatrix();
        this.rootNode.traverse(renderNode);
    }

}

function buildNodeFromObjectData(object, node) {
    let rotation_quat = quat.create();
    quat.rotateZ(rotation_quat, rotation_quat, object.rotation);
    let source = new TRS(object.translation, rotation_quat, object.scale);
    let n = node.clone();
    n.id = object.id; // may be undefined
    n.source = source;

    function setTextureInfo(node) {
        node.textureInfo = object.textureInfo;
    }
    n.traverse(setTextureInfo);
    return n;
}
