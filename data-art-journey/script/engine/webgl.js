
import * as twgl from './twgl.js'
import { dom } from './dom.js';
import { uniforms } from './uniforms.js'
import { input } from './input.js'
import { particles } from '../module/particles.js';

function Webgl ()
{
    const gl = dom.canvas.getContext("webgl", {preserveDrawingBuffer: true});
    let width, height;
    let ready = false;

    this.init = function ()
    {
        uniforms.blueNoise = twgl.createTexture(gl, { src: 'asset/shadertoy-bluenoise.png' });
        uniforms.frostMap = twgl.createTexture(gl, { src: 'asset/TexturesCom_Ice0002_1_S.jpg' });
        uniforms.noiseMap = twgl.createTexture(gl, { src: 'asset/noise_simplex.png' });
        // uniforms.panoramaMap = twgl.createTexture(gl, { src: 'asset/panorama.png' });
        ready = true;
    }

    this.update = function ()
    {
        if (!ready) this.init();

        if (twgl.resizeCanvasToDisplaySize(gl.canvas))
        {
            width = gl.canvas.width;
            height = gl.canvas.height;
            uniforms.resolution = [width, height];
            particles.resize(gl);
        }
        
        const mouse = input.getMouse();
        uniforms.mouse = [mouse[0]/width, 1.-mouse[1]/height];
    }

    this.clear = function()
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, width, height);
    }

    this.crop = function(x, y, w, h)
    {
        gl.viewport(x, y, w, h);
    }
    
    this.draw = function (item)
    {
        item.draw(gl);
    }
}

export let webgl = new Webgl();