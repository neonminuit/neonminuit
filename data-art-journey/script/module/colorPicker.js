
import * as twgl from '../engine/twgl.js'
import { shader } from '../shader/shader.js'
import { uniforms } from '../engine/uniforms.js'
import { shaderColorPicker } from '../shader/shaderColorPicker.js'

function ColorPicker ()
{
    let mesh;
    let material;
    let ready = false;

    this.init = function(gl)
    {
        mesh = twgl.createBufferInfoFromArrays(gl,
            twgl.primitives.createPlaneVertices()
        )
        material = twgl.createProgramInfo(gl, [
            shader.common+shader.vertex,
            shader.common+shaderColorPicker
        ]);
        ready = true;
    }

    this.draw = function(gl)
    {
        if (!ready) this.init(gl);

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.useProgram(material.program);

        twgl.setBuffersAndAttributes(gl, material, mesh);
        twgl.setUniforms(material, uniforms);
        twgl.drawBufferInfo(gl, mesh);
    }
}

export const colorPicker = new ColorPicker();