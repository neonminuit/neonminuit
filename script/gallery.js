
const glsl = x => x;

import { pointcloud } from "./pointcloud.js";

const canvas = document.getElementById("shader");
const app = pointcloud(canvas);

// canvas.addEventListener("mouseleave", event => test.update = false);
// canvas.addEventListener("mouseenter", event => test.update = true);

canvas.addEventListener("mousemove", event => {
    app.mouse = [ event.clientX, event.clientY ];
});

canvas.addEventListener("mousedown", event => {
    app.clic = true;
});

canvas.addEventListener("contextmenu", event => {
    event.preventDefault();
    event.stopPropagation();
});

canvas.addEventListener("mouseup", event => {
    app.clic = false;
});

canvas.addEventListener("mouseleave", event => {
    app.clic = false;
});

canvas.addEventListener("wheel", event => {
    app.wheel = event.wheelDelta;
});