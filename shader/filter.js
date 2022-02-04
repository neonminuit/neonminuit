
const glsl = x => x;

export const filter_pixel = glsl`
precision mediump float;
uniform float time, temporal;
uniform vec2 resolution;
uniform sampler2D framePoints, frameFilter, frameNormal, blueNoiseMap, matcap;
varying vec2 uv;

vec2 hash21(float p)
{
	vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
	p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}


void main()
{
    vec4 frame = texture2D(framePoints, uv);
    vec3 ply_color = frame.rgb;
    vec4 ply_normal = texture2D(frameNormal, uv);
    float depth = frame.a;
    
    // could be uniforms, with GUI interaction
    float radius = 10.;
    float strength = 10.;
    float temporalBlend = .97;
    
    
    // blue noise offset
    vec2 seed = gl_FragCoord.xy/1024.+hash21(time*60.)*temporal*.1;
    vec3 bluenoise = texture2D(blueNoiseMap, (seed)).rgb;
    vec2 jitter = (bluenoise.xy*2.-1.)*radius/resolution.xy;

    // difference between pixel depth and neighbor depth
    
    // float diff_normal = dot(ply_normal.xy, texture2D(frameNormal, uv+jitter).xy);
    // diff_normal = clamp(diff_normal*1., 0., 1.);
    
    float diff_depth = abs(depth-texture2D(framePoints, uv+jitter).a);
    diff_depth = 1.-clamp(diff_depth*strength, 0., 1.);
    
    // float diff = 0.;
    // const float samples = 5.;
    // for (float index = 0.; index < samples; index++) {
    //     // blue noise offset
    //     vec2 seed = gl_FragCoord.xy/1024.+index/samples;//+fract(time);//*1337.;//*temporal;
    //     vec3 bluenoise = texture2D(blueNoiseMap, (seed)).rgb;
    //     vec2 jitter = (bluenoise.xy*2.-1.)*radius/resolution.xy;
    //     float diff_depth = abs(depth-texture2D(framePoints, uv+jitter).a);
    //     diff = mix(diff, diff_depth, 0.5);
    // }
    // diff = 1.-clamp(diff*strength, 0., 1.);

    // difference between pixel depth and neighbor depth
    
    // float diff_normal = dot(ply_normal.xy, texture2D(frameNormal, uv+jitter).xy);
    // diff_normal = clamp(diff_normal*1., 0., 1.);
    



    float diff = diff_depth;
    
    // if (uv.x > 0.5) {
        // diff = diff_normal;//min(diff_depth, diff_normal);
    // }

    // apply difference as a shade
    // diff = clamp(diff + sqrt(bluenoise.z), 0., 1.);

    
    // diff = step(0.5, diff);
    
    if (depth == 0.) {
        ply_color = vec3(0);
    }

    vec2 uvm = ply_normal.xy+((ply_normal.zw*.5+.5)*.1);
    ply_color = texture2D(matcap, ply_normal.zw).rgb;

    if (temporal > 0.5) {
        diff = mix(diff, texture2D(frameFilter, uv).a, temporalBlend);
    }
        // temporal noise attenuation
        gl_FragColor = vec4(ply_color, diff);
    // } else {
    //     gl_FragColor = vec4(ply_color, 1);
    // }
    // gl_FragColor = vec4(diff);
}
`+"";