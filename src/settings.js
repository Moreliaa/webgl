import getDefaultMaterials from "./materials.js";

export default class Settings {
    constructor () {
        this.diffuseColor = vec3.fromValues(1.0,1.0,1.0);
        this.specularColor = vec3.fromValues(1.0,1.0,1.0);
        this.shininess = 32.0;

        this.lightPosition = vec3.fromValues(0.0,0.0,12.0);
        this.attenuationLinear = 0.014;
        this.attenuationSquare = 0.007;
        this.lightAmbient = vec3.fromValues(0.3,0.3,0.3);
        this.lightDiffuse = vec3.fromValues(0.5,0.5,0.5);
        this.lightSpecular = vec3.fromValues(1.0,1.0,1.0);
        this.lightMovement = true;
        
        this.isDirLighting = true;
        this.dirLightDirection = vec3.fromValues(-2.0,-1.0,0.0);
        this.dirLightAmbient = vec3.fromValues(0.1,0.1,0.2);
        this.dirLightDiffuse = vec3.fromValues(0.2,0.2,0.6);
        this.dirLightSpecular = vec3.fromValues(1.0,1.0,1.0);

        this.isFlashlight = true;
        this.flashlightAngleCutoffInner = 25;
        this.flashlightAngleCutoffOuter = 35;
        this.flashlightAmbient = vec3.fromValues(0.1,0.1,0.1);
        this.flashlightDiffuse = vec3.fromValues(0.5,0.8,0.9);
        this.flashlightSpecular = vec3.fromValues(1.0,1.0,1.0);

        this.isTextured = true;

        this.shadingStyles_enum = Object.freeze({
            phong: Symbol("phong"),
            blinnphong: Symbol("blinnphong")
        });
        this.shadingStyle = this.shadingStyles_enum.blinnphong;

        this.scenes_enum = Object.freeze({
            whale: Symbol("whale"),
            boxes: Symbol("boxes"),
            solar: Symbol("solar"),
            blend: Symbol("blend"),
            asteroid: Symbol("asteroid"),
        });
        this.scene = this.scenes_enum.whale;

        this.isReflection = false;

        document.getElementById("ctrl_reflection").onchange = (event) => {
            this.isReflection = event.target.checked;
        }

        document.getElementById("ctrl_flashlightActive").onchange = (event) => {
            this.isFlashlight = event.target.checked;
        }

        let ctrl_flashlightAngleCutoffInner = document.getElementById("ctrl_flashlightAngleCutoffInner");
        let ctrl_flashlightAngleCutoffOuter = document.getElementById("ctrl_flashlightAngleCutoffOuter");
        ctrl_flashlightAngleCutoffInner.value = this.flashlightAngleCutoffInner;
        ctrl_flashlightAngleCutoffOuter.value = this.flashlightAngleCutoffOuter;
        ctrl_flashlightAngleCutoffInner.onchange = (event) => {
            this.flashlightAngleCutoffInner = event.target.value;
            if (this.flashlightAngleCutoffOuter < this.flashlightAngleCutoffInner) {
                this.flashlightAngleCutoffOuter = this.flashlightAngleCutoffInner;
                ctrl_flashlightAngleCutoffOuter.value = this.flashlightAngleCutoffInner;
            }
        }

        ctrl_flashlightAngleCutoffOuter.onchange = (event) => {
            this.flashlightAngleCutoffOuter = event.target.value;
            if (this.flashlightAngleCutoffInner > this.flashlightAngleCutoffOuter) {
                this.flashlightAngleCutoffInner = this.flashlightAngleCutoffOuter;
                ctrl_flashlightAngleCutoffInner.value = this.flashlightAngleCutoffOuter;
            }
        }

        document.getElementById("ctrl_directionalLighting").onchange = (event) => {
            this.isDirLighting = event.target.checked;
        }

        document.getElementById("ctrl_blinnphongShading").onchange = (event) => {
            this.shadingStyle = this.shadingStyles_enum.blinnphong;
        }

        document.getElementById("ctrl_phongShading").onchange = (event) => {
            this.shadingStyle = this.shadingStyles_enum.phong;
        };

        document.getElementById("ctrl_scene_whale").onchange = (event) => {
            this.scene = this.scenes_enum.whale;
        };

        document.getElementById("ctrl_scene_boxes").onchange = (event) => {
            this.scene = this.scenes_enum.boxes;
        };

        document.getElementById("ctrl_scene_solar").onchange = (event) => {
            this.scene = this.scenes_enum.solar;
        };

        document.getElementById("ctrl_scene_blend").onchange = (event) => {
            this.scene = this.scenes_enum.blend;
        };
        document.getElementById("ctrl_scene_asteroid").onchange = (event) => {
            this.scene = this.scenes_enum.asteroid;
        };

        document.getElementById("ctrl_rotatingLight").onchange = (event) => {
            this.lightMovement = true;
        };

        document.getElementById("ctrl_staticLight").onchange = (event) => {
            this.lightMovement = false;
        };

        let controls_colors = {
            ctrl_diffuseColor: "diffuseColor",
            ctrl_specularColor: "specularColor",
            ctrl_lightAmbientColor: "lightAmbient",
            ctrl_lightDiffuseColor: "lightDiffuse",
            ctrl_lightSpecularColor: "lightSpecular",
            ctrl_dirLightAmbientColor: "dirLightAmbient",
            ctrl_dirLightDiffuseColor: "dirLightDiffuse",
            ctrl_dirLightSpecularColor: "dirLightSpecular",
            ctrl_flashlightAmbientColor: "flashlightAmbient",
            ctrl_flashlightDiffuseColor: "flashlightDiffuse",
            ctrl_flashlightSpecularColor: "flashlightSpecular",
        };
        for (let v in controls_colors) {
            let ctrl = document.getElementById(v);
            let prop = this[controls_colors[v]];
            ctrl.value = colorVec3ToHexString(prop);
            ctrl.onchange = (event) => {
                let val = event.target.value;
                let hex_r = (parseInt(`${val[1]}${val[2]}`, 16) + 1) / 256;
                let hex_g = (parseInt(`${val[3]}${val[4]}`, 16) + 1) / 256;
                let hex_b = (parseInt(`${val[5]}${val[6]}`, 16) + 1) / 256;
                this[controls_colors[v]] = vec3.fromValues(hex_r, hex_g, hex_b);
            }
        }


        let controls_float = {
            ctrl_shininess: "shininess",
        };
        for (let f in controls_float) {
            let ctrl = document.getElementById(f);
            ctrl.value = this[controls_float[f]];
            ctrl.onchange = (event) => {
                this[controls_float[f]] = event.target.value;
            }
        }

        let ctrl_lightX = document.getElementById("ctrl_lightPosX");
        let ctrl_lightY = document.getElementById("ctrl_lightPosY");
        let ctrl_lightZ = document.getElementById("ctrl_lightPosZ");
        ctrl_lightX.value = this.lightPosition[0];
        ctrl_lightY.value = this.lightPosition[1];
        ctrl_lightZ.value = this.lightPosition[2];

        ctrl_lightX.onchange = (event) => {
            this.lightPosition[0] = event.target.value;
        };
        ctrl_lightY.onchange = (event) => {
            this.lightPosition[1] = event.target.value;
        };
        ctrl_lightZ.onchange = (event) => {
            this.lightPosition[2] = event.target.value;
        };

        let ctrl_attenuationLinear = document.getElementById("ctrl_attenuationLinear");
        let ctrl_attenuationSquare = document.getElementById("ctrl_attenuationSquare");
        ctrl_attenuationLinear.value = this.attenuationLinear;
        ctrl_attenuationSquare.value = this.attenuationSquare;
        ctrl_attenuationLinear.onchange = (event) => {
            this.attenuationLinear = event.target.value;
        };
        ctrl_attenuationSquare.onchange = (event) => {
            this.attenuationSquare = event.target.value;
        };

        document.getElementById("ctrl_texture").onchange = (event) => {
            this.isTextured = event.target.checked;
        };

        let defaultMaterials = getDefaultMaterials();
        let materialDivContents = "";
        for (let m of defaultMaterials) {
            let radio = `<input id="ctrl_mat_${m.name}" type="radio" name="material">`;
            let label = `<label for="ctrl_mat_${m.name}">${m.name}</label>`
            materialDivContents += radio + label;
        }
        let materialDiv = document.getElementById("defaultMaterials");
        materialDiv.innerHTML = materialDivContents;
        for (let m of defaultMaterials) {
            let ctrl = document.getElementById(`ctrl_mat_${m.name}`);
            ctrl.onclick = (event) => {
                document.getElementById("ctrl_diffuseColor").value = colorVec3ToHexString(m.diffuse);
                document.getElementById("ctrl_specularColor").value = colorVec3ToHexString(m.specular);
                document.getElementById("ctrl_shininess").value = m.shininess;
                this.diffuseColor = m.diffuse;
                this.specularColor = m.specular;
                this.shininess = m.shininess;
            };
        }
        
    }

    isPhongShading() {
        return this.shadingStyle === this.shadingStyles_enum.phong ||
            this.shadingStyle === this.shadingStyles_enum.blinnphong;
    }

    isBlinnPhongShading() {
        return this.shadingStyle === this.shadingStyles_enum.blinnphong;
    }
}

function colorVec3ToHexString(vec) {
    let hex_r = (256 * vec[0] - 1).toString(16);
    let hex_g = (256 * vec[1] - 1).toString(16);
    let hex_b = (256 * vec[2] - 1).toString(16);
    return `#${hex_r[0]}${hex_r[1]}${hex_g[0]}${hex_g[1]}${hex_b[0]}${hex_b[1]}`;
}