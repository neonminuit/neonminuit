
const glsl = x => x;

export const point_vertex = glsl`

attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;
attribute vec2 anchor;
uniform float time;
uniform mat4 camera, perspective;
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
    float size = 40.;// + 20. * pow(rng.y, 40.);
    float delay = .5;
    float anim = fract(time/delay);
    vec3 seed = vec3(floor(time/delay));
    vec3 h = mix(hash33(seed), hash33(seed+1.), anim);
    vec3 target = (h*2.-1.) * 0.2;
    float mask = smoothstep(.9,0.,length(p-target));
    // mask = pow(mask, .5);
    // size *= mix(1., abs(cos(anim*3.14)), step(0.01, mask));
    // float leap = 0.;//min(1., anim*2.)
    // if (anim * 2. <= 1.) leap = anim; 
    p += normal * 1.5 * mask * rng.z;
    // p.y += .05*cos(length(p)*20.+time);
    // vec3 x = normalize(cross(normal, vec3(0,1,0)));
    // vec3 y = normalize(cross(x, normal));
    // p += (x * anchor.x + y * anchor.y) * size / 1000.;
    gl_Position = perspective * vec4(p, 1);
    gl_Position.xy += vec2(anchor.x, -anchor.y) * size / resolution;
    // v_color = vec3(1)*abs(dot(normal, mat3(camera) * vec3(0,0,1)));
    v_color = color;//(mat3(camera) * normal)*.5+.5;
    v_normal = (mat3(camera) * normal)*.5+.5;
    uv = anchor;
    depth = gl_Position.z;
}
`+""

export const point_pixel = glsl`

precision mediump float;
varying vec2 uv;
varying vec3 v_color, v_normal;
varying float depth;
uniform float time, temporal;
uniform sampler2D blueNoiseMap, matcap;

void main()
{
    // vec2 seed = gl_FragCoord.xy/1024.+fract(time)*1337.*temporal;
    // vec3 bluenoise = texture2D(blueNoiseMap, fract(seed)).rgb;
    if (length(uv) > 1.) discard;
    // vec3 normal = normalize(v_normal);
    // vec3 rf = 
    // float light = pow(dot(normal, vec3(0,1,0))*.5+.5, 10.);
    // vec2 uvm = -v_normal.xy*(.5+(uv*.5+.5)*.5);
    // vec3 color = texture2D(matcap, uvm).rgb;
    vec3 color = v_color;
    // color += light;
    gl_FragColor = vec4(color, depth);
}
`+"";

export const point_normal_pixel = glsl`

precision mediump float;
varying vec2 uv;
varying vec3 v_normal;
uniform float time, temporal;
uniform sampler2D blueNoiseMap;

void main()
{
    // vec2 seed = gl_FragCoord.xy/1024.+fract(time)*1337.*temporal;
    // vec3 bluenoise = texture2D(blueNoiseMap, fract(seed)).rgb;
    if (length(uv) > 1.) discard;
    // vec3 normal = normalize(v_normal);
    // vec3 rf = 
    // float light = pow(dot(normal, vec3(0,1,0))*.5+.5, 10.);
    // vec3 color = v_color;
    // color += light;
    gl_FragColor = vec4(v_normal.xy, uv*.5+.5);
}
`+"";