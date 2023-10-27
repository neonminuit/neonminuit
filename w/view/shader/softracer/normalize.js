
const glsl = x => x;

export const normalize = glsl`

vec3 getRay (vec2 uv)
{
    return normalize(mat3(viewInverse) * (projectionInverse * vec4(uv * 2. - 1., 0, 1.)).xyz);
}

void main()
{
    vec2 uv = gl_FragCoord.xy/resolution;
    vec2 vv = 2. * (gl_FragCoord.xy - resolution.xy / 2.) / resolution.y;
    float depth = texture2D(frameDepth, uv).a;

    

    vec3 pos = viewInverse[3].xyz;

    vec3 noff = vec3(2./resolution.xy,0);
    vec3 n = pos + getRay(uv+noff.zy) * texture2D(frameDepth, uv+noff.zy).a;
    vec3 s = pos + getRay(uv-noff.zy) * texture2D(frameDepth, uv-noff.zy).a;
    vec3 e = pos + getRay(uv+noff.yz) * texture2D(frameDepth, uv+noff.xz).a;
    vec3 w = pos + getRay(uv-noff.yz) * texture2D(frameDepth, uv-noff.xz).a;
    vec3 normal = cross(n-s, e-w);
    
    gl_FragColor = vec4(normalize(normal), 1);
}
`+"";