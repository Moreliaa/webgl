import Node from "./node.js";
import TRS from "./trs.js";

export default class Scene {
    constructor(rootNode = undefined, commonDrawInfo) {
        this.rootNode = rootNode || new Node(new TRS(), 0);
        this.commonDrawInfo = commonDrawInfo; // for textureDiffuse & textureSpecular
    }

    updateNodeRotationZ(nodeId, rotation) {
        function rotateNode(node) {
            if (node.id === nodeId) {
                node.rotateZ(rotation);
            }
        }

        this.rootNode.traverse(rotateNode);
    }

    addObjectHierarchy(objects, objectRoot) {
        let nodes = [];
        console.log("objectRoot", objectRoot)
        for (let i = 0; i < objects.length; i++) {
            let c = objects[i];
            let rotation_quat = quat.create();
            quat.rotateZ(rotation_quat, rotation_quat, c.rotation);
            let source = new TRS(c.translation, rotation_quat, c.scale);
            let n = objectRoot.clone();
            n.source = source;
            console.log(n);
            if (i === 0) {
                n.setParent(this.rootNode);
            } else {
                n.setParent(nodes[i - 1]);
            }
            nodes.push(n);
        }

        console.log("hierarchy", this.rootNode);
    }

    drawScene(gl, drawableProgramInfo, settings, camera, lightPosCurrent, perspectiveMatrix) {
        let commonDrawInfo = this.commonDrawInfo;
        function renderNode(node) {
            for (let drawable of node.drawables) {
                drawable.render(gl, drawableProgramInfo, commonDrawInfo, settings, camera, lightPosCurrent, perspectiveMatrix, node);
            }
        }

        this.rootNode.updateWorldMatrix();
        this.rootNode.traverse(renderNode);
    }

}

