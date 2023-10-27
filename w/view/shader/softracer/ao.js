
const glsl = x => x;

export const ao = glsl`

void main()
{
    vec3 color = vec3(1);

    // sample depth from buffer
    vec2 uv = gl_FragCoord.xy/resolution;
    float depth = texture2D(frameDepth, uv).a;
    
    // could be uniforms, with GUI interaction
    float radius = 20.;
    float strength = 100.;
    float temporalBlend = .97;
    
    if (depth < farClip)
    {
        // blue noise offset
        vec2 seed = gl_FragCoord.xy/1024.+fract(time);
        vec3 bluenoise = texture2D(blueNoiseMap, fract(seed)).rgb;
        vec2 jitter = (bluenoise.xy*2.-1.)*bluenoise.z*radius/resolution.xy;

        // difference between pixel depth and neighbor depth
        float diff = abs(depth-texture2D(frameDepth, uv+jitter).a);

        // apply difference as a shade
        color *= 1.-clamp(diff*strength, 0., 1.);

        // temporal noise attenuation
        color = mix(color, texture2D(frameAO, uv).rgb, temporalBlend);
    }

    gl_FragColor = vec4(color, 1);
}
`+"";