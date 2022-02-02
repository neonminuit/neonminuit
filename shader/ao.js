
const glsl = x => x;

export const ao_pixel = glsl`
precision mediump float;
uniform float time, temporal;
uniform vec2 resolution;
uniform sampler2D frameDepth, frameAO, blueNoiseMap;
varying vec2 uv;

void main()
{
    vec4 frame = texture2D(frameDepth, uv);
    vec3 ply_color = frame.rgb;
    float depth = frame.a;
    
    // could be uniforms, with GUI interaction
    float radius = 5.;
    float strength = 50.;
    float temporalBlend = .97;
    
    
    // blue noise offset
    vec2 seed = gl_FragCoord.xy/1024.+fract(time)*1337.*temporal;
    vec3 bluenoise = texture2D(blueNoiseMap, fract(seed)).rgb;
    vec2 jitter = (bluenoise.xy*2.-1.)*radius/resolution.xy;

    // difference between pixel depth and neighbor depth
    float diff = abs(depth-texture2D(frameDepth, uv+jitter).a);

    // apply difference as a shade
    diff = 1.-clamp(diff*strength, 0., 1.);
    // diff = clamp(diff + sqrt(bluenoise.z), 0., 1.);

    
    // diff = step(0.5, diff);
    
    if (depth == 0.) {
        ply_color = vec3(1);
    }
    if (temporal > 0.5) {
        diff = mix(diff, texture2D(frameAO, uv).a, temporalBlend);
    }
        // temporal noise attenuation
        gl_FragColor = vec4(ply_color * diff, diff);
    // } else {
    //     gl_FragColor = vec4(ply_color, 1);
    // }
    // gl_FragColor = vec4(diff);
}
`+"";