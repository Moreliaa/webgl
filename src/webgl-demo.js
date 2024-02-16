import { runRotatingSquareDemo } from "./rotating-square/rs_demo.js";
import { runCube3DDemo } from "./cube-3d/cube3d_demo.js";

main();

function main() {
    const button_rs_demo = document.querySelector("#button_rs_demo");
    const button_cube3d_demo = document.querySelector("#button_cube3d_demo");

    button_rs_demo.onclick = function() {
        runRotatingSquareDemo();
        button_rs_demo.classList.add("active");
        button_cube3d_demo.classList.remove("active");
    };

    button_cube3d_demo.onclick = function() {
        runCube3DDemo();
        button_rs_demo.classList.remove("active");
        button_cube3d_demo.classList.add("active");
    };

    button_cube3d_demo.click();
}