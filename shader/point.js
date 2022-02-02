
const glsl = x => x;

export const point_vertex = glsl`

attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;
attribute vec2 anchor;
uniform float time;
uniform mat4 perspective;
uniform vec2 resolution;
varying vec2 uv;
varying vec3 v_color, v_normal;
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
    vec3 p = position.xyz;
    vec3 rng = hash33(p*100.);
    float size = 4.;// + 20. * pow(rng.y, 40.);
    // float anim = fract(rng.x  + time);
    // size *= sin(anim*3.14);
    // p += normal * .01 * anim;
    // p.y += .05*cos(length(p)*20.+time);
    // vec3 x = normalize(cross(normal, vec3(0,1,0)));
    // vec3 y = normalize(cross(x, normal));
    // p += (x * anchor.x + y * anchor.y) * size / 1000.;
    gl_Position = perspective * vec4(p, 1);
    gl_Position.xy += anchor * size / resolution;
    v_color = color;
    v_normal = normal;
    uv = anchor;
    depth = gl_Position.z;
}
`+""

export const point_pixel = glsl`

precision mediump float;
varying vec2 uv;
varying vec3 v_color, v_normal;
varying float depth;
uniform float temporal;

void main()
{
    if (length(uv) > 1.) discard;
    // vec3 normal = normalize(v_normal);
    // vec3 rf = 
    // float light = pow(dot(normal, vec3(0,1,0))*.5+.5, 10.);
    vec3 color = v_color;
    // color += light;
    gl_FragColor = vec4(color, depth);
}
`+"";