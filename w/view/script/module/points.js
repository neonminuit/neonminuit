
import * as twgl from '../lib/twgl-full.module.js'
const prim = twgl.primitives;

export function points(gl, shader, count, subdivisions, attributes)
{
    const sub = subdivisions || [1,1];
    const mesh = prim.createPlaneVertices(0,0,sub[0],sub[1]);
    const quantity = new Float32Array(count*4*2);
    Object.assign(mesh, {
        quantity: {
            numComponents: 2,
            data: quantity.map((x, i) => i % 2 == 0 ? i/2/count : i/2),
            divisor: 1,
        },
    });
    if (attributes !== undefined) {
        Object.keys(attributes).forEach(key => {
            console.log(attributes[key]);
            mesh['ply_'+key] = {
                numComponents: attributes[key].itemSize,
                data: attributes[key].array,
                divisor: 1,
            };
        });
    }

    let arrays = null;;

    return function draw(uniforms) {
        if (arrays == null) {
            arrays = twgl.createVertexArrayInfo(gl, shader, twgl.createBufferInfoFromArrays(gl, mesh));
        }
        // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.useProgram(shader.program);
        // gl.enable(gl.DEPTH_TEST);
        // gl.depthFunc(gl.LEQUAL);
        // gl.enable(gl.CULL_FACE);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        twgl.setBuffersAndAttributes(gl, shader, arrays);
        twgl.setUniforms(shader, uniforms);
        twgl.drawBufferInfo(gl, arrays, gl.TRIANGLES, arrays.numelements, 0, count);
    }
}
