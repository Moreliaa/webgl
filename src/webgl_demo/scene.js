import Node from "./node.js";

export default class Scene {
    constructor(rootNode = undefined) {
        this.rootNode = rootNode || new Node([0,0,0], 0, [1.0,1.0,1.0]);
    }

    updateNodeRotation(nodeId, rotation) {
        function rotateNode(node) {
            if (node.id === nodeId) {
                node.rotate(rotation);
            }
        }

        this.rootNode.traverse(rotateNode);
    }

    addObjectHierarchy(objects, drawInfo) {
        let nodes = [];
        for (let i = 0; i < objects.length; i++) {
            let c = objects[i];
            let n = new Node(c.translation, c.rotation, c.scale, c.id, drawInfo);
            if (i === 0) {
                n.setParent(this.rootNode);
            } else {
                n.setParent(nodes[i - 1]);
            }
            nodes.push(n);
        }
    }

    drawScene(gl, drawableProgramInfo, textureInfo, settings, camera, lightPosCurrent, perspectiveMatrix) {
        function renderNode(node) {
            for (let drawable of node.drawables) {
                drawable.render(gl, drawableProgramInfo, textureInfo, settings, camera, lightPosCurrent, perspectiveMatrix, node);
            }
        }

        this.rootNode.updateWorldMatrix();
        this.rootNode.traverse(renderNode);
    }

}

