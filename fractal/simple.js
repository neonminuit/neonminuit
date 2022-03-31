
import * as twgl from './twgl-full.module.js'
import { fullscreen } from './shader/common.js';
import { fractal } from './shader/fractal.js';
import { fractal2 } from './shader/fractal2.js';
import { fractal3 } from './shader/fractal3.js';
import { fractal4 } from './shader/fractal4.js';
const prim = twgl.primitives;
const m4 = twgl.m4;

export function simple (canvas)
{
    // webgl components
    const gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    const mesh = twgl.createBufferInfoFromArrays(gl, prim.createPlaneVertices());
    const overlay = document.getElementById("editor");
    const lines = fractal.split('\n');
    const fullText = fractal.split('\n').join(' ');
    const shaders = [
        twgl.createProgramInfo(gl, [ fullscreen, fractal4 ]),
        // twgl.createProgramInfo(gl, [ fullscreen, fractal ]),
        // twgl.createProgramInfo(gl, [ fullscreen, fractal2 ]),
        // twgl.createProgramInfo(gl, [ fullscreen, fractal3 ]),
    ]
    let currentShader = 0;
    let tick = 0;
    let line = 0;
    let width = 1;
    let height = 1;
    
    // highlight
    var editor = ace.edit("editor", {
        mode: "ace/mode/glsl",
        theme: "ace/theme/monokai",
        highlightGutterLine: false,
        highlightActiveLine: false,
        showPrintMargin: false,
        showGutter: false,
        maxLines: 2,
        fontSize: 16,
    });

    // global uniforms
    const uniforms = {
        time: 0,
        tick: 0,
        line: 0,
        round: 0,
        cursor: 0,
        cursorSize: 1,
        seed: Math.floor(Math.random()*10000),
        resolution: [canvas.width, canvas.height],
    };

    // main loop
    function render(time) {
        requestAnimationFrame(render);

        const dpi = 1;

        // resize 
        if (twgl.resizeCanvasToDisplaySize(gl.canvas, dpi)) {
            width = gl.canvas.width;
            height = gl.canvas.height;
            uniforms.resolution = [width, height];
            tick = 0;
        }
        const size = 1
        const column = 5;
        const cursor = line % height;
        let steps = 3;

        // uniforms
        const t = (Date.now() / 1000.) % 1000000;
        const dt = t - uniforms.time;
        uniforms.time = t;
        uniforms.tick = tick;
        uniforms.round = Math.floor(line / (height * steps));
        uniforms.steps = Math.floor(line / height) % steps;

        // text info
        const textCursor = Math.floor(t*10.);
        const textWidth = 50;
        // const textCode = fullText.substring(textCursor%fullText.length, (textCursor - textWidth)%fullText.length).replace('\t', ' ');
        const textCode = lines[textCursor%lines.length];
        let text = "";
        // for (let i = 30; i >= 0; --i) {
        //     text += String.fromCharCode(textCode.charCodeAt(0) + i);
        // }
        // text += ":";
        text += textCode;
        
        editor.setValue(text, -1);
        overlay.style.bottom = (cursor + size) * (1 / dpi) + "px";

        currentShader = Math.floor(uniforms.round) % shaders.length;

        draw(null, shaders[currentShader], 0, cursor, width, size);
        
        line = (line + size) % Number.MAX_VALUE;
        tick = (tick + 1) % Number.MAX_VALUE;
    }

    function draw (frame, shader, x, y, w, h)
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
        gl.viewport(x, y, w, h);
        gl.useProgram(shader.program);
        twgl.setBuffersAndAttributes(gl, shader, mesh);
        twgl.setUniforms(shader, uniforms);
        twgl.drawBufferInfo(gl, mesh);
    }

    requestAnimationFrame(render);
}

const canvas = document.getElementById("shader");
const app = simple(canvas);