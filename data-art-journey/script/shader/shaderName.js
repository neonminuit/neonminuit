

const glsl = x => x;

export const shaderName = glsl`

    uniform float time, fadeIn, fadeOut, animation, blackOut;
    uniform vec2 resolution;
    uniform sampler2D image, blueNoise;
    varying vec2 uv;

    void main() {

        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = (gl_FragCoord.xy - resolution.xy / 2.) / resolution.y;

        
        float _BlockDelay = 0.1;
        float _BlockThreshold = 0.95;
        float _BlockStrength = 10./resolution.y;
        float blockTime = time/_BlockDelay;
        vec2 lod = hash21(floor(blockTime))*50.;
        vec2 blocks = floor(uv * lod);// / _BlockLod;
        vec3 rng = hash33(vec3(blocks, floor(blockTime)));
        float displace = step(_BlockThreshold, rng.z) * _BlockStrength * sin(fract(blockTime)*3.14);
        uv += (rng.xy * 2. - 1.) * displace * animation;//(1.-fadeOut);

        float range = resolution.y/4.;
        float offset = (1.-uv.x)*6.28;
        offset += fract(p.x*range) * 2.;
        // offset += displace * 40.;
        vec3 color = 0.5 + 0.5 * cos(vec3(0,.3,.6)*6.28+offset);

        uv -= 0.5;
        uv.x *= resolution.x/resolution.y;
        uv.x *= 0.25;
        uv += 0.5;

        vec4 map = texture2D(image, uv);
        vec3 text = map.rgb * map.a;
        text *= step(0.,uv.x) * step(uv.x, 1.) * step(0.,uv.y) * step(uv.y, 1.);

        color *= max(vec3(0.1), text);
        
        color *= fadeIn;
        color *= 1.-blackOut;
        
        gl_FragColor = vec4(color, 1);
    }
`