
import * as twgl from '../lib/twgl-full.module.js'
import { gizmos_vertex, gizmos_color } from '../../shader/shader_gizmos.js'
const prim = twgl.primitives;

export function gizmo(gl)
{
    const mesh = twgl.createBufferInfoFromArrays(gl, prim.createPlaneVertices());
    const shader = twgl.createProgramInfo(gl, [gizmos_vertex, gizmos_color]);

    console.log(prim.createPlaneVertices());
    console.log(prim.createSphereVertices(.1,10,10));

    return function draw(uniforms) {
        // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.useProgram(shader.program);
        // gl.enable(gl.DEPTH_TEST);
        // gl.depthFunc(gl.LEQUAL);
        // gl.enable(gl.CULL_FACE);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        twgl.setBuffersAndAttributes(gl, shader, mesh);
        twgl.setUniforms(shader, uniforms);
        twgl.drawBufferInfo(gl, mesh);
    }
}
