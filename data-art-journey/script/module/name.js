
import * as twgl from '../engine/twgl.js'
import { shader } from '../shader/shader.js'
import { uniforms } from '../engine/uniforms.js'
import { shaderName } from '../shader/shaderName.js'
import { dom } from '../engine/dom.js';
import { time } from '../engine/time.js';
import { user } from '../engine/user.js';

const v3 = twgl.v3;

function Name ()
{
    let mesh;
    let material;
    let canvas;
    let context2d;

    let fontSize = 40;
    let text = '';
    let binText = '';
    let binArray = [];

    let elapsed = 0;
    let animation = 1;
    let ready = false;

    this.getBinary = () => { return binArray.join(''); }
    this.setAnimation = (v) => { animation = v; }
    this.getText = () => { return text; }

    this.init = function(gl)
    {
        mesh = twgl.createBufferInfoFromArrays(gl,
            twgl.primitives.createPlaneVertices()
        )

        material = twgl.createProgramInfo(gl, [
            shader.common+shader.vertex,
            shader.common+shaderName
        ]);

        canvas = document.createElement('canvas');
        canvas.width  = 1024;
        canvas.height = 256;

        context2d = canvas.getContext('2d');
        context2d.font = fontSize + 'px kolikoRegular';
        context2d.textAlign = 'center';
        context2d.shadowColor = 'rgba(255,255,255,0.9)';
        context2d.shadowBlur = 10;

        uniforms.image = twgl.createTexture(gl, { src: canvas, flipY: true, minMag: gl.LINEAR });

        uniforms.zoom = 1;

        ready = true;
    }

    this.draw = function(gl)
    {
        if (!ready) this.init(gl);

        let c = canvas;
        let ctx = context2d;

        // elapsed += time.getDeltaTime();

        uniforms.colorCursorPicked = user.getColorCursor();
        // console.log(uniforms.colorCursorPicked);

        if (text != dom.inputText.value)// || elapsed > 1)
        {
            text = dom.inputText.value;
            // elapsed = 0;

            let x = c.width/2;
            let y = c.height/2;
            ctx.clearRect(0,0,c.width,c.height);
            binArray = [];

            ctx.font = fontSize/6 + 'px kolikoRegular';
            ctx.fillStyle = '#aaa'
            for (let index = 0; index < text.length; index++) {
                binArray[index] = text.charCodeAt(index).toString(2);
                // const p = this.random21(index*72 + 196*Math.floor(time.getTime()));
                // const a = p[0] * 6.28;
                // const r = p[1] * 60 + 30;
                // ctx.fillText(binArray[index], x + Math.cos(a) * r * 2, y + Math.sin(a) * r);
                // ctx.fillText(binArray[index], x + p[0] * 50, y + p[1] * 50);
                // const i = index * 10;
                // ctx.fillText(binArray[index], x+i, y+i);
            }
            ctx.fillText(binArray.join(' '), x, y+20);
            
            
            ctx.fillStyle = '#fff'
            ctx.font = fontSize + 'px kolikoRegular';
            ctx.fillText(text, x, y+fontSize/4);

        }

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.useProgram(material.program);
        uniforms.animation = animation;
        twgl.setTextureFromElement(gl, uniforms.image, c);
        twgl.setBuffersAndAttributes(gl, material, mesh);
        twgl.setUniforms(material, uniforms);
        twgl.drawBufferInfo(gl, mesh);
    }

    this.getTextWidth = function()
    {

        return dom.inputText.value.length * fontSize * 2;
        // context2d.font = fontSize + 'px kolikoRegular';
        // return context2d.measureText(text).width;
    }

    this.setZoom = function(zoom)
    {
        uniforms.zoom = zoom;
    }

    this.random21 = function(p)
    {
        let p3 = v3.multiply([p,p,p], [.1031, .1030, .0973]);
        p3[0] = p3[0] % 1;
        p3[1] = p3[1] % 1;
        p3[2] = p3[2] % 1;
        const dt = v3.dot(p3, v3.add([p3[1], p3[2], p3[0]], [33.33,33.33,33.33]));
        p3 = v3.add(p3, [dt,dt,dt]);
        return [((p3[0]+p3[1])*p3[2])%1, ((p3[0]+p3[2])*p3[1])%1];
        // return fract((p3.xx+p3.yz)*p3.zy);
    }
}

export const name = new Name();