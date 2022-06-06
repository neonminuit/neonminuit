
import * as twgl from '../engine/twgl.js'
import { shader } from '../shader/shader.js'
import { shaderCursorVertex, shaderCursorPixel } from '../shader/shaderCursor.js'
import { uniforms } from '../engine/uniforms.js'
import { input } from '../engine/input.js'
import { time } from '../engine/time.js'
import { loadOBJ } from '../engine/load.js'

const m4 = twgl.m4;

function Cursor ()
{
    let mesh;
    let material;
    let ready = false;
    let loaded = false;
    let elapsed = 0;

    // 3d coordinates
    const eye = [0, 0, 5];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const camera = m4.lookAt(eye, target, up);
    const view = m4.inverse(camera);

    this.init = function(gl)
    {
        material = twgl.createProgramInfo(gl, [
            shader.common+shaderCursorVertex,
            shader.common+shaderCursorPixel
        ])
        loadOBJ('asset/cursor.obj', function(attributes) {
            mesh = twgl.createBufferInfoFromArrays(gl, attributes);
            loaded = true;
        })
        ready = true;
    },

    this.draw = function(gl)
    {
        if (!ready) this.init(gl);

        if (loaded)
        {
            const elapsed = time.getTime();
            const width = gl.canvas.width;
            const height = gl.canvas.height;
            const projection = m4.perspective(30 * Math.PI / 180, width / height, 0.5, 10);
            const viewProjection = m4.multiply(projection, view);
            const world = m4.identity();
            const vel = input.getMouseVelocity();
            const velMax = 10;
            let rotY = 0.1*Math.sign(vel[0]) * Math.min(velMax, Math.abs(vel[0]));
            let rotX = 0.1*Math.sign(vel[1]) * Math.min(velMax, Math.abs(vel[1]));
            let offset = -1.;
            // m4.translate(world, [0,offset,0], world);
            rotX -= Math.sin(elapsed) * .2;
            rotY += Math.cos(elapsed) * .2;
            rotY += 0.5;
            m4.rotateX(world, rotX, world);
            m4.rotateY(world, rotY, world);
            // m4.translate(world, [0,-offset,0], world);
            // const world = m4.translation([this.x, this.y, 0]);
            uniforms.matrix = m4.multiply(viewProjection, world);
      
            // gl.viewport(0, 0, width, height);
            // gl.disable(gl.DEPTH_TEST);
            // gl.enable(gl.CULL_FACE);
            // gl.enable(gl.BLEND);
            // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            // gl.useProgram(this.materialShadow.program);
            // twgl.setBuffersAndAttributes(gl, this.materialShadow, this.mesh);
            // twgl.setUniforms(this.materialShadow, uniforms);
            // twgl.drawBufferInfo(gl, this.mesh);
            
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.disable(gl.BLEND);
            gl.useProgram(material.program);
            twgl.setBuffersAndAttributes(gl, material, mesh);
            twgl.setUniforms(material, uniforms);
            twgl.drawBufferInfo(gl, mesh);
        }
    }
}

export const cursor = new Cursor();