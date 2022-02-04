
import * as twgl from '../lib/twgl-full.module.js'
import { vertex_fullscreen, pixel_uv } from '../../shader/shader_frame.js'
const prim = twgl.primitives;

export function frame(gl, pixelShader)
{
    const mesh = twgl.createBufferInfoFromArrays(gl, prim.createPlaneVertices());
    const shader = twgl.createProgramInfo(gl, [vertex_fullscreen, pixelShader || pixel_uv]);

    return function draw(uniforms, rect) {
        rect = rect || [0, 0, 1, 1];
        gl.viewport(
            rect[0]*gl.canvas.width,
            rect[1]*gl.canvas.height,
            rect[2]*gl.canvas.width,
            rect[3]*gl.canvas.height);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.useProgram(shader.program);
        twgl.setBuffersAndAttributes(gl, shader, mesh);
        twgl.setUniforms(shader, uniforms);
        twgl.drawBufferInfo(gl, mesh);
    }
}

