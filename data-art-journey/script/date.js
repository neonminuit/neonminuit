
shader.timeDateVertex = glsl`
    
    attribute vec2 texcoord;
    uniform vec2 resolution, scale, offset;
    varying vec2 uv;

    void main() {
        float aspect = resolution.x/resolution.y;
        uv = (texcoord-.5)*vec2(aspect, 1)*.5+.5;
        vec2 pos = texcoord * 2. - 1.;
        gl_Position = vec4(pos, 0, 1);
    }

`;

shader.timeDate = glsl`
    
    uniform float time, transition, fade, blend;
    uniform vec2 resolution, cursor;
    uniform sampler2D image, blueNoise, frostMap;
    varying vec2 uv;

    void main() {
        const float count = 5.;
        vec2 pos = uv;
        vec2 p;
        pos -= 0.5;
        pos *= 1.+.9*length(pos);
        pos += 0.5;
        vec3 color = vec3(0);
        vec3 blue = texture2D(blueNoise, gl_FragCoord.xy/1024.).rgb;
        vec2 mous = cursor * 2. - 1.;
        mous.x *= resolution.x / resolution.y;
        mous *= -1.;
        float range = 1.;//clamp(length(mous)*.5, 0., 1.);
        // range *= blend*.9+.1;
        if (fade > 0.5) range *= transition;

        p = pos * 1.;
        
        // p -= 0.5;
        // p *= 1.-1.*length(p);
        // p += 0.5;
        
        p = abs(mod(p+1.,2.)-1.);
        float frost = texture2D(frostMap, p).r + blue.z*.1;
        float a = 6.28*frost;
        float strength = 40./resolution.y;
        float lele = length(pos-.5);
        strength *= ss(.0,.5,lele);
        // vec2 uvv = 2. * (gl_FragCoord.xy - resolution / 2.) / resolution.y;
        pos += (1.-blend)*strength*vec2(cos(a),sin(a))*ss(.5,.4,lele);

        for (float i = 0.; i < count; ++i)
        {
            float ii = i / count;
            vec2 offset = mous*.1*ii*range;
            float scale = 1.-.9*ii*range;//*blue.z;
            offset += blue.xy * ii * range * 10. / resolution.y;
            vec4 map = texture2D(image, (pos-.5)*scale+.5+offset);
            
            float alpha = map.a;
            if (i > 0.)
            {
                alpha *= 1.-ii;
                alpha *= sin(ii*6.28-time*6.)*0.5+0.5;
                alpha = clamp(alpha + 1.-sin(ii*3.14), 0. ,1.);
                alpha = mix(1./count, alpha, range)*map.a;
                alpha = mix(0., alpha, blend);
            }
            else
            {
            }

            color += map.rgb*alpha;
        }
        color *= fade > 0.5 ? transition : 1.-transition;
        // float t = time;
        // float i = floor(t);
        // vec2 p = pos;
        // p.x += t*.2;
        // vec2 seed = floor(p*8.);
        // float salt = hash12(seed);
        // float salt = sin(p.x+sin(p.x*10.+sin(p.x*100.)*.1));
        // float salt = mix(hash12(seed), hash12(seed+1.), fract(t));
        // vec3 background = vec3(.2) * salt;
        // p.y += salt*.1 * range;
        // vec3 background = vec3(0,1,0) * .001 / abs(p.y-.5);
        // color = mix(background, color, color.g);
        // color += 
        range = 0.;
        p = pos;
        p *= rot(blue.z*.4-.1);
        p -= vec2(.75+range);
        float light = (.01+sin(blue.z*3.14)*.02)/length(p);
        float len = length(pos-.5)+blue.z*.1-range;
        light += ss(mix(0.4, 0.0, blend), mix(1., 3.0, blend), len);
        color += light * (fade < 0.5 ? 1.-transition : 1.);
        p = pos * 1.;
        p = abs(mod(p+1.,2.)-1.);
        // p *= 1.-length(p-.5);
        // p += .5;
        // color.rgb += .1*pow(frost, 10.);
        color.rgb *= mix(ss(.05,.0,-.45+length(pos-.5)), 1., blend);
        gl_FragColor = vec4(color, 1);
        // gl_FragColor = vec4(uv, 0.5, 1);
    }

`;

const timeDate = 
{
    pause: false,
    blend: 1,

    mesh: 0,
    material: 0,
    canvas: 0,
    context2d: 0,
    init: function(gl)
    {
        this.mesh = twgl.createBufferInfoFromArrays(gl,
            prim.createPlaneVertices()
        )
        this.material = twgl.createProgramInfo(gl, [
            common+shader.timeDateVertex,
            common+shader.timeDate
        ]);
        this.canvas = document.createElement('canvas');
        this.canvas.width  = 1024;
        this.canvas.height = 1024;
        this.context2d = this.canvas.getContext('2d');
        this.context2d.font = this.fontSize + 'px alarm_clockregular';
        this.context2d.textAlign = 'center';
        this.context2d.shadowColor = 'rgba(0,255,0,.5)';
        this.context2d.shadowBlur = 20;

        uniforms.image = twgl.createTexture(gl, { src: this.canvas, flipY: true });
    },
    draw: function(gl)
    {
        if (!this.pause)
        {
            // hours, minutes, seconds
            let c = this.canvas;
            let ctx = this.context2d;
            let x = c.width/2;
            let y = c.height/2;// + this.fontSize/2;
            uniforms.scale = [1,1];
            uniforms.offset = [0,0.5];
            let date = new Date();
            let hours = date.getHours(); if (hours < 10) hours = '0' + hours;
            let minutes = date.getMinutes(); if (minutes < 10) minutes = '0' + minutes;
            let seconds = date.getSeconds(); if (seconds < 10) seconds = '0' + seconds;
            let millis = Math.floor(date.getMilliseconds()/10.); if (millis < 10) millis = '0' + millis;
            let day = date.getDay(); if (day < 10) day = '0' + day;
            let month = date.getMonth(); if (month < 10) month = '0' + month;
            let year = '20 22';

            let time = hours + " " + minutes + " " + seconds + " " + millis;
            let timeYear = day + " " + month + ' ' + year;

            ctx.clearRect(0,0,c.width,c.height);
            // for (let index = 0; index < 5; index++) {
                
                // y -= this.fontSize*.5;

            y = c.height/2-25;
            ctx.font = '100px alarm_clockregular';
            // ctx.fillStyle = '#24003C'
            // ctx.fillText('00:00:00', x, y);
            ctx.fillStyle = '#31ED11'
            ctx.fillText(time, x, y);
            
            y = c.height/2+100;
            ctx.font = '100px alarm_clockregular';
            // ctx.fillStyle = '#24003C'
            // ctx.fillText('00-00-0000', x, y);
            ctx.fillStyle = '#31ED11'
            ctx.fillText(timeYear, x, y);
            // }
            twgl.setTextureFromElement(gl, uniforms.image, c);

            this.blend = clamp01(this.blend + deltaTime * 2);
            uniforms.blend = easeInOutSine(this.blend, 0, 1, 1);
        }
        else
        {
            this.blend = clamp01(this.blend - deltaTime * 2);
            uniforms.blend = easeInOutSine(this.blend, 0, 1, 1);
        }

        // uniforms.blend = 0;

        
        gl.viewport(0, 0, width, height);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.clearColor(0,0,0,1);
        gl.useProgram(this.material.program);
        twgl.setBuffersAndAttributes(gl, this.material, this.mesh);
        twgl.setUniforms(this.material, uniforms);
        twgl.drawBufferInfo(gl, this.mesh);
    },
}