

const glsl = x => x;

export const shaderColorPicker = glsl`

    uniform float time, fadeIn, fadeOut;
    uniform vec2 resolution;
    uniform sampler2D image, blueNoise;
    varying vec2 uv;

    float LED (float range, float thin, float offset, float x)
    {
        return ss(.0,thin,abs(repeat(x, 1./range))*range-offset+thin/2.);
    }

    void main() {

        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 pos = (gl_FragCoord.xy - resolution.xy / 2.) / resolution.y;

        float scale = 20.;
        scale = mix(10., 20., fadeIn);
        // scale = mix(scale, 200., fadeOut);
        float range = resolution.y/scale;
        float saturation = .8;
        float shade = .2;
        float thin = 0.5;
        float offset = 0.333;

        float r = LED(range, thin, offset, pos.x);
        float g = LED(range, thin, offset, pos.x+0.333/range);
        float b = LED(range, thin, offset, pos.x+0.666/range);

        vec3 led = vec3(r,g,b)*(1.-saturation)+saturation;

        float colorOffset = uv.x*6.28+1.5;
        vec3 color = 0.5 + 0.5 * cos(vec3(0,.3,.6)*6.28+colorOffset);

        thin = .5;
        led *= ss(-thin,thin,abs(fract(pos.x*range*3.)*2.-1.))*shade+(1.-shade);
        led *= ss(-thin,thin,abs(fract(pos.y*range)*2.-1.))*shade+(1.-shade);
        
        // if (fadeIn > 0.01)
        // {
            color *= mix(vec3(1), led, fadeIn);
        // }
        // else
        // {
            // range = 0.;
            // vec3 blue = texture2D(blueNoise, gl_FragCoord.xy/1024.).rgb;
            
            
            // float aspect = resolution.x/resolution.y;
            // pos = uv;
            // pos = (pos-.5)*vec2(aspect, 1)*.5+.5;
            // pos -= 0.5;
            // pos *= 1.+.9*length(pos);
            // pos += 0.5;
            // vec2 p = pos;
            // p *= rot(blue.z*.4-.1);
            // p -= vec2(.75+range);
            // float light = (.01+sin(blue.z*3.14)*.02)/length(p);
            // light += ss(0.0, 3.0, length(pos-.5)+blue.z*.1-range);
            // color = mix(color, vec3(light), fadeOut);
        // }

        color *= 1.-fadeOut;
        
        gl_FragColor = vec4(color, 1);
    }
`