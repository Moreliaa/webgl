export default class Settings {
    constructor () {
        this.ambientColor = vec3.fromValues(0.3, 0.8, 0.8);
        this.diffuseColor = vec3.fromValues(0.8,0.3,0.3);
        this.specularColor = vec3.fromValues(0.8,0.3,0.3);

        this.ambientStrength = 0.2;
        this.diffuseStrength = 1.0;
        this.shininess = 32.0;

        let controls_vec3 = {
            ctrl_ambientColor: "ambientColor",
            ctrl_diffuseColor: "diffuseColor",
            ctrl_specularColor: "specularColor",
        };
        for (let v in controls_vec3) {
            let ctrl = document.getElementById(v);
            let prop = this[controls_vec3[v]];
            let hex_r = (256 * prop[0] - 1).toString(16);
            let hex_g = (256 * prop[1] - 1).toString(16);
            let hex_b = (256 * prop[2] - 1).toString(16);
            ctrl.value = `#${hex_r[0]}${hex_r[1]}${hex_g[0]}${hex_g[1]}${hex_b[0]}${hex_b[1]}`
            ctrl.onchange = (event) => {
                let val = event.target.value;
                let hex_r = (parseInt(`${val[1]}${val[2]}`, 16) + 1) / 256;
                let hex_g = (parseInt(`${val[3]}${val[4]}`, 16) + 1) / 256;
                let hex_b = (parseInt(`${val[5]}${val[6]}`, 16) + 1) / 256;
                this[controls_vec3[v]] = vec3.fromValues(hex_r, hex_g, hex_b);
            }
        }


        let controls_float = {
            ctrl_ambientStrength: "ambientStrength",
            ctrl_diffuseStrength: "diffuseStrength",
            ctrl_shininess: "shininess",
        };
        for (let f in controls_float) {
            let ctrl = document.getElementById(f);
            ctrl.value = this[controls_float[f]];
            ctrl.onchange = (event) => {
                let value = parseFloat(event.target.value);
                this[controls_float[f]] = value;
            }
        }
        
    }
}

function setColorValue(id, rgbvec3) {
    let control = document.getElementById(id);
    control.value = `${rgbvec3[0].toFixed(1)},${rgbvec3[1].toFixed(1)},${rgbvec3[2].toFixed(1)}`;
}