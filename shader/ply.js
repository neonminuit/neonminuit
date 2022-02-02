
const glsl = x => x;

export const ply_vertex = glsl`

attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;
attribute vec2 anchor;
uniform mat4 perspective;
uniform vec2 resolution;
varying vec2 uv;
varying vec3 v_color;
varying float depth;

// Dave Hoskins https://www.shadertoy.com/view/4djSRW
vec3 hash33(vec3 p3)
{
    p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy + p3.yxx)*p3.zyx);
}

void main()
{
    uv = anchor*.5+.5;
    vec3 p = position.xyz;
    vec3 rng = hash33(p*100.);
    float size = .008 + .004 * rng.y;
    // p += normal * .003 * rng.x;
    // vec3 x = normalize(cross(normal, vec3(0,1,0)));
    // vec3 y = normalize(cross(x, normal));
    // p += (x * uv.x + y * uv.y) * size;
    gl_Position = perspective * vec4(p, 1);
    gl_Position.xy += anchor * 4. / resolution;
    v_color = color;
    depth = gl_Position.z;
}
`+""

export const ply_pixel = glsl`

precision mediump float;
varying vec2 uv;
varying vec3 v_color;

void main()
{
    gl_FragColor = vec4(v_color, 1);
}
`+"";

export const ply_depth = glsl`

precision mediump float;
varying vec2 uv;
varying vec3 v_color;
varying float depth;

void main()
{
    gl_FragColor = vec4(v_color, depth);
}
`+"";