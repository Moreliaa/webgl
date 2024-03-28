import { runCube3DDemo } from "./cube_old_demo.js";

main();

function main() {
    runCube3DDemo();

    document.querySelector("#input_cube3d_fov").addEventListener("change", function (event) {
        document.querySelector("#input_cube3d_fov").setAttribute("value", event.target.value);
    });
    document.querySelector("#input_cube3d_translation").addEventListener("change", function (event) {
        document.querySelector("#input_cube3d_translation").setAttribute("value", event.target.value);
    });
    document.querySelector("#input_cube3d_rotationSpeed").addEventListener("change", function (event) {
        document.querySelector("#input_cube3d_rotationSpeed").setAttribute("value", event.target.value);
    });
    document.querySelector("#input_cube3d_ambientLight").addEventListener("change", function (event) {
        document.querySelector("#input_cube3d_ambientLight").setAttribute("value", event.target.value);
    });
    document.querySelector("#input_cube3d_video").addEventListener("change", function (event) {
        document.querySelector("#input_cube3d_video").setAttribute("value", event.target.value);
    });
}