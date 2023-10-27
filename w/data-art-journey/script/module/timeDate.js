
import * as twgl from '../engine/twgl.js'
import { shader } from '../shader/shader.js'
import { shaderTimeDateVertex, shaderTimeDatePixel } from '../shader/shaderTimeDate.js'
import { clamp01, easeInOutSine } from '../engine/utils.js'
import { uniforms } from '../engine/uniforms.js'
import { time } from '../engine/time.js'

function TimeDate ()
{
    let fontSize = 100;

    let ready = false;
    let pause = false;
    let blend = 1;
    
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let millis = 0;
    let day = 0;
    let month = 0;
    let year = 0;

    let mesh;
    let material;
    let canvas;
    let context2d;

    this.getPause = () => { return pause; }

    this.init = function(gl)
    {
        mesh = twgl.createBufferInfoFromArrays(gl,
            twgl.primitives.createPlaneVertices()
        )
        material = twgl.createProgramInfo(gl, [
            shader.common+shaderTimeDateVertex,
            shader.common+shaderTimeDatePixel
        ]);

        canvas = document.createElement('canvas');
        canvas.width  = 1024;
        canvas.height = 1024;

        context2d = canvas.getContext('2d');
        context2d.font = fontSize + 'px alarm_clockregular';
        context2d.textAlign = 'center';
        context2d.shadowColor = 'rgba(0,255,0,.5)';
        context2d.shadowBlur = 20;

        uniforms.image = twgl.createTexture(gl, { src: canvas, flipY: true, minMag: gl.LINEAR });

        uniforms.elapsed = 0;

        ready = true;
    }

    this.toggle = function()
    {
        pause = !pause;
    }

    this.getTime = function()
    {
        return '' + hours + minutes + seconds + millis + day + month + year;
    } 
    
    this.update = function()
    {
        if (!pause)
        {
            // hours, minutes, seconds
            let date = new Date();

            hours = date.getHours(); if (hours < 10) hours = '0' + hours;
            minutes = date.getMinutes(); if (minutes < 10) minutes = '0' + minutes;
            seconds = date.getSeconds(); if (seconds < 10) seconds = '0' + seconds;
            millis = Math.floor(date.getMilliseconds()/10.); if (millis < 10) millis = '0' + millis;
            day = date.getDate(); if (day < 10) day = '0' + day;
            month = date.getMonth()+1; if (month < 10) month = '0' + month;
            year = '2022';
        }
    }
    
    this.draw = function(gl)
    {
        if (!ready) this.init(gl);

        const deltaTime = time.getDeltaTime();

        let c = canvas;
        let ctx = context2d;
        
        if (ready && !pause)
        {
            let x = c.width/2;
            let y = c.height/2;
            let text = ''
            ctx.clearRect(0,0,c.width,c.height);
            
            text = hours + '/' + minutes + '/' + seconds + '/' + millis;
            y = c.height/2-25;
            ctx.font = fontSize+'px alarm_clockregular';
            ctx.fillStyle = '#31ED11'
            ctx.fillText(text, x, y);
            
            text = day + '-' + month + '-' + year;
            y = c.height/2+fontSize;
            ctx.font = fontSize+'px alarm_clockregular';
            ctx.fillStyle = '#31ED11'
            ctx.fillText(text, x, y);
            
            
            blend = clamp01(blend + deltaTime * 2);
            uniforms.blend = easeInOutSine(blend, 0, 1, 1);
        }
        else
        {
            blend = clamp01(blend - deltaTime * 2);
            uniforms.blend = easeInOutSine(blend, 0, 1, 1);
        }
        
        uniforms.elapsed += deltaTime * blend;
        
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.useProgram(material.program);
        twgl.setTextureFromElement(gl, uniforms.image, c);
        twgl.setBuffersAndAttributes(gl, material, mesh);
        twgl.setUniforms(material, uniforms);
        twgl.drawBufferInfo(gl, mesh);
    }
}

export const timeDate = new TimeDate();