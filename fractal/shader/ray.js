
import { common } from "./common.js";

const glsl = x => x;

export const ray_head = common+glsl`

// in vec2 uv;
varying vec2 uv;
// layout(location = 0) out vec4 color;
const float FRAME_MIX = 0.;
const float FRAME_MAX = 1.;
float mat;
vec3 rng, prm, lpos;

`;

export const ray_foot = glsl`

void addColor (inout vec3 color, in vec3 frame)
{
    if (frameMode == FRAME_MIX)
    {
        color.rgb += frame;
    }
    else
    {
        color.rgb = max(color.rgb, frame);
    }
}

void main() {
    vec4 color = vec4(0,0,0,1);
    prm = hash31(round + seed);
    float depth = 0.;

    // accumulation
    const float frames = countFrame;
    for (float f = 0.; f < frames; ++f) {
        depth = 0.;
        mat = -1.;
        rng = hash33(vec3(gl_FragCoord.xy, time + f));

        // coordinates
        vec3 pos = cam;
        vec2 uu = gl_FragCoord.xy / resolution.xy;
        uu = (uu*2.-1.)*vec2(resolution.x/resolution.y, 1.);
        uu += (rng.xy*2.-1.)/resolution.xy;
        vec3 ray = normalize(vec3(uu, fov));

        // raymarching
        const float count = countRaymarch;
        // float index = count;
        float shade = 0.;//index/count;
        for (float index = count; index > 0.; --index) {
            float dist = map(pos);
            if (dist < volume_bias) { shade = index/count; break; }
            dist *= 0.9 + 0.1 * rng.z;
            pos += ray * dist;
            depth += dist;
        }
        float crop = step(depth,10.)*step(.001,shade);

        // if (steps == 0.) {
        //     addColor(color.rgb, vec3(fract(depth))*crop);
        //     continue;
        // }

        // material
        float m = mat;
        // if (steps == 1.) {
        //     addColor(color.rgb, (.5+.5*cos(vec3(0,.3,.6)*6.3+m))*crop);
        //     continue;
        // }
        
        // lighting
        if (steps == 0.) {
            addColor(color.rgb, vec3(shade));
            continue;
        }

        // normal
        vec2 off=vec2(normal_bias,0); // compute normal by NuSan (https://www.shadertoy.com/view/3sBGzV)
        vec3 normal = normalize(map(pos)-vec3(map(pos-off.xyy), map(pos-off.yxy), map(pos-off.yyx)));
        if (steps == 1.) {
            addColor(color.rgb, (reflect(normal, vec3(0,0,-1))*.5+.5)*crop);
            continue;
        }

        // color
        addColor(color.rgb, colorize(pos, normal, ray, m)*shade);
        
        // reflections
        if (countReflections > 0.) {
            ray = reflect(ray, normal);
            vec3 rough = tan(normalize(rng*2.-1.));
            ray = normalize(ray + rough*.1);
            pos += ray*0.01;
            // index = countReflections;
            float shady = 0.;
            for (float index = countReflections; index > 0.; --index) {
                float dist = map(pos);
            if (dist < .001) { shady = index/count; break; }
                dist *= 0.9 + 0.1 * rng.z;
                pos += ray * dist;
            }
            m = mat;
            normal = normalize(map(pos)-vec3(map(pos-off.xyy), map(pos-off.yxy), map(pos-off.yyx)));
            color.rgb += colorize(pos, normal, ray, m)*shade*shady*2.;// max(color.rgb, colorize(pos, normal, ray, m)*shade*index/count*2.);
        }
    }
    if (frameMode == FRAME_MIX)
        color.rgb /= frames;

    gl_FragColor = color;
}

`+"";