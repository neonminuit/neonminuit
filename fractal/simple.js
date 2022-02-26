
import * as twgl from './twgl-full.module.js'
import { fractal, fullscreen, image } from './shader/fractal.js';
const prim = twgl.primitives;
const m4 = twgl.m4;

export function simple (canvas)
{
    // webgl components
    const gl = canvas.getContext("webgl2");
    const mesh = twgl.createBufferInfoFromArrays(gl, prim.createPlaneVertices());
    const shader = twgl.createProgramInfo(gl, [ fullscreen, fractal ]);
    const draw = twgl.createProgramInfo(gl, [ fullscreen, image ]);
    const frame = [ twgl.createFramebufferInfo(gl), twgl.createFramebufferInfo(gl) ];

    // global uniforms
    const uniforms = {
        time: 0,
        resolution: [canvas.width, canvas.height],
        blueNoiseMap: twgl.createTexture(gl, { src: "shader/bluenoise_shadertoy.png", wrap: gl.REPEAT, minMag: gl.NEAREST } ),
    };

    let tick = 0;

    // main loop
    function render(time) {
        requestAnimationFrame(render);

        // resize canvas and frames
        if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
            uniforms.resolution = [gl.canvas.width, gl.canvas.height];
            twgl.resizeFramebufferInfo(gl, frame[0]);
            twgl.resizeFramebufferInfo(gl, frame[1]);
        }

        // uniforms
        uniforms.time = (Date.now() / 1000.) % 1000000;
        uniforms.tick = tick;
        uniforms.framebuffer = frame[tick%2].attachments[0];

        gl.bindFramebuffer(gl.FRAMEBUFFER, frame[(tick+1)%2].framebuffer);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.useProgram(shader.program);
        twgl.setBuffersAndAttributes(gl, shader, mesh);
        twgl.setUniforms(shader, uniforms);
        twgl.drawBufferInfo(gl, mesh);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.useProgram(draw.program);
        twgl.setBuffersAndAttributes(gl, draw, mesh);
        twgl.setUniforms(draw, uniforms);
        twgl.drawBufferInfo(gl, mesh);
        
        tick++;
    }

    requestAnimationFrame(render);
}

const canvas = document.getElementById("shader");
const app = simple(canvas);