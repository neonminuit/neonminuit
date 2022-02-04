
import { sdf } from './sdf.js'

const glsl = x => x;

export const raymarch = sdf + glsl`

vec3 rng, bnoise;
float material;

void main()
{
    // noise
    rng = hash33(vec3(gl_FragCoord.xy, time));
    bnoise = texture2D(blueNoiseMap, fract(gl_FragCoord.xy/1024.+time)).rgb;
    
    // coordinates
    vec2 uv = gl_FragCoord.xy/resolution;

    vec3 pos = viewInverse[3].xyz;
    vec3 ray = normalize(mat3(viewInverse) * (projectionInverse * vec4(uv * 2. - 1., 0, 1.)).xyz);
    
    // raymarch
    float total = 0.;
    bool hit = false;
    for (float index = 20.; index > 0.; --index)
    {
        float dist = map(pos);
        if (dist < .001) {
            hit = true;
            break;
        }
        dist *= .9+.1*bnoise.z;
        pos += ray * dist;
        total += dist;
        if (total > farClip) break;
    }

    // depth frame accumulation
    vec4 frame = texture2D(frameDepth, uv);
    
    if (hit && (frame.a == 0. || total < frame.a))
    {
        frame = vec4(material, 0, 0, total);
    }

    gl_FragColor = frame;

    // if (fract(time/delay) > .99) gl_FragColor = vec4(0);
}
`+"";