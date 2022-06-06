
import * as twgl from '../engine/twgl.js'
import { shader } from '../shader/shader.js'
import { uniforms } from '../engine/uniforms.js'
import { webgl } from '../engine/webgl.js'
import { name } from './name.js'
import { shaderParticlesVertex, shaderParticlesPixel } from '../shader/shaderParticles.js'
import { clamp01, easeInOutSine } from '../engine/utils.js'
import { time } from '../engine/time.js'
import { state } from '../engine/state.js'

function Particles ()
{
    let mesh;
    let material;
    let frame;

    let ready = false;
    let stop = false;
    let fadeIn = 0;
    let delay = 0;
    let fadeOut = 0;

    this.init = function(gl)
    {
        let attributes = {
            position: [],
            texcoord: [],
            indices: [],
            quantity: { data: [], numComponents: 2 }
        };
        const plane = twgl.primitives.createPlaneVertices();
        const count = 256*256;
        let indice = 0;
        for (let index = 0; index < count; index++) {
            for (let j = 0; j < plane.position.length; j++) {
                attributes.position.push(plane.position[j]);
            }
            for (let j = 0; j < plane.texcoord.length; j++) {
                attributes.texcoord.push(plane.texcoord[j]);
                attributes.quantity.data.push(index);
            }
            for (let j = 0; j < plane.indices.length; j++) {
                attributes.indices.push(plane.indices[j] + indice);
            }
            indice += 4;
        }
        mesh = twgl.createBufferInfoFromArrays(gl, attributes)
        material = twgl.createProgramInfo(gl, [
            shader.common+shaderParticlesVertex,
            shader.common+shaderParticlesPixel
        ]);
        if (frame == undefined) frame = twgl.createFramebufferInfo(gl);
        ready = true;
    }

    this.resize = function(gl)
    {
        if (frame == undefined) frame = twgl.createFramebufferInfo(gl);
        twgl.resizeFramebufferInfo(gl, frame);
    }

    this.reset = function()
    {
        stop = false;
    }

    this.draw = function(gl)
    {
        if (!ready) this.init(gl);

        if (!stop)
        {

            fadeIn = clamp01(fadeIn + time.getDeltaTime() / 3.);
            delay = clamp01(delay + time.getDeltaTime() / 10.);
            if (delay >= 0.99)
            {
                fadeOut = clamp01(fadeOut + time.getDeltaTime() / 3.);
                if (fadeOut >= 0.99)
                {
                    state.next();
                    stop = true;
                }
            }
            
            gl.bindFramebuffer(gl.FRAMEBUFFER, frame.framebuffer);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.viewport(0, 0, frame.width, frame.height);
            name.setAnimation(1-fadeIn);
            uniforms.fadeIn = 1;
            webgl.draw(name);
            
            webgl.clear();
            webgl.draw(name);
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.useProgram(material.program);
            uniforms.frame = frame.attachments[0];
            uniforms.jump = easeInOutSine(fadeIn, 0, 1, 1);
            uniforms.blackOut = easeInOutSine(fadeOut, 0, 1, 1);
            twgl.setBuffersAndAttributes(gl, material, mesh);
            twgl.setUniforms(material, uniforms);
            twgl.drawBufferInfo(gl, mesh);
        }
    }
}

export const particles = new Particles();