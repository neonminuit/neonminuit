
import * as twgl from '../engine/twgl.js'
import { shader } from '../shader/shader.js'
import { shaderMetaball } from '../shader/shaderMetaball.js'
import { uniforms } from '../engine/uniforms.js'
import { input } from '../engine/input.js'

function Metaball ()
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
            shader.common+shaderMetaball
        ]);
        ready = true;
    }

    this.draw = function(gl)
    {
        if (!ready) this.init(gl);

        const mouseSmooth = input.getMouseSmooth();
        const width = gl.canvas.width;
        const height = gl.canvas.height;
        uniforms.cursor = [mouseSmooth[0]/width, 1.-mouseSmooth[1]/height];

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.useProgram(material.program);
        twgl.setBuffersAndAttributes(gl, material, mesh);
        twgl.setUniforms(material, uniforms);
        twgl.drawBufferInfo(gl, mesh);
    }
}

export let metaball = new Metaball();