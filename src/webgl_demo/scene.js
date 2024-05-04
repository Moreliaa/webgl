import Node from "./node.js";

export default class Scene {
    constructor() {
        this.rootNode = new Node([0,0,0], 0, [1.0,1.0,1.0]);
        this.nodeMap = {};
        this.uniqueIdCounter = 0;
        this.addNode(this.rootNode);
    }

    setRootNode (node) {
        this.rootNode = node;
    }

    addNode(node) {
        if (node.id === undefined) {
            node.id = this.uniqueIdCounter++;
        } else if (this.nodeMap[node.id]) {
            console.error("Previously used id " + node.id + "in scene.");
            return;
        }

        this.nodeMap[node.id] = node;
    }

    updateNodeRotation(nodeId, rotation) {
        if (!this.nodeMap[nodeId]) {
            console.error("Failed to update node. No id with name " + nodeId);
            return;
        }

        this.nodeMap[nodeId].rotate(rotation);
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
            this.addNode(n);
        }
    }

    drawScene(gl, settings, camera, perspectiveMatrix) {
        this.rootNode.updateWorldMatrix();

        for (let node of Object.values(this.nodeMap)) {
            node.draw(gl, settings, camera, perspectiveMatrix);
        }
    }

}