
const glsl = x => x;

import { simple } from "../app/simple.js";

const canvas = document.getElementById("shader");
const app = simple(canvas);

// canvas.addEventListener("mouseleave", event => test.update = false);
// canvas.addEventListener("mouseenter", event => test.update = true);

// canvas.addEventListener("mousemove", event => {
//     app.parameters.mouse = [ event.clientX, event.clientY ];
// });