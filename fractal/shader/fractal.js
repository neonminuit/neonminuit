
import { common } from "./common.js";

const glsl = x => x;

export const fullscreen = "#version 300 es"+glsl`

precision mediump float;
uniform vec2 resolution;
in vec2 texcoord;
out vec2 uv;

void main() {
    gl_Position = vec4(texcoord * 2. - 1., 0, 1);
    uv = texcoord;//gl_Position.xy * vec2(resolution.x/resolution.y,1.);
}

`+"";

export const image = "#version 300 es"+glsl`

precision mediump float;
uniform sampler2D framebuffer;
in vec2 uv;
layout(location = 0) out vec4 color;

void main() {
    color = texture(framebuffer, uv);
}

`+"";

export const fractal = "#version 300 es"+glsl`

precision mediump float;
uniform vec2 resolution;
uniform float time, tick;
uniform sampler2D blueNoiseMap, framebuffer;
in vec2 uv;
layout(location = 0) out vec4 color;
mat2 rot(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }
vec2 hash21(float p) {
	vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
	p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}
vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy + p3.yxx)*p3.zyx);
}
vec3 hash32(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

// globals
float mat;
vec3 rng;
const float delay = 10.;

float map (vec3 p) {
    float dist = 100.;
    float shape = 100.;
    float t = 1.0+floor(time/delay);
    float r = 1.5;
    float f = 2.;
    float s = 0.8;
    float a = 1.0;
    const float count = 5.;
    for (float i = 0.; i < count; ++i) {
        p = abs(p)-r*a;
        p.xy *= rot(t/a);
        p.xz *= rot(t/a);
        shape = length(p)-s*a;
        mat = shape < dist ? i/count : mat;
        dist = min(dist, shape);
        a /= f;
    }
    // p.x += abs(mod(p.z*20.+1.,2.)-1.)*.01/abs(p.z);
    // p.y += abs(mod(p.z*10.+1.,2.)-1.)*.01/abs(p.z);
    // p.z += abs(mod(p.x*10.+1.,2.)-1.)*.01/abs(p.x);
    // p.x += sin(p.z*100.)*.001/abs(p.z);
    shape = length(p.xy)-.001;//.0001/max(.001,abs(p.z));//*rng.x;
    // shape = min(shape, length(p.xz)-.001);//*rng.x;
    // shape = min(shape, length(p.yz)-.001);//*rng.x;
    mat = shape < dist ? -1. : mat;
    dist = min(dist, shape);
    return dist;
}

vec3 colorize (vec3 p, vec3 n, vec3 r, float m) {
    float dp = length(p);
    // vec3 tint = .5 + .5 * cos(vec3(1,2,3)*.5+m*2.);
    vec3 tint = .5 + .5 * cos(vec3(1,2,3)*.5+dp*2.);
    if (m >= 0.) tint = vec3(0);
    tint += pow(dot(reflect(r,n), vec3(0,1,0))*.5+.5, 10.);
    // vec3 tint = .5 + .5 * cos(vec3(0.,.3,.6)*6.+m*6.);
    return (tint);// * smoothstep(10.0, 0.0, dp);
}

void main() {
    float td = fract(time/delay);
    float fade = smoothstep(1.,.95,td);
    color = vec4(0,0,0,1);
    // rng = texture(blueNoiseMap, uv*.5+.5+hash21(time)*step(.99, fade)).rgb;
    rng = hash33(vec3(gl_FragCoord.xy, time*step(.99, fade)));
    mat = -1.;
    
    vec2 uu = (uv*2.-1.)*vec2(resolution.x/resolution.y, 1.);
    uu += (rng.xy*2.-1.)/resolution.xy;
    vec3 pos = vec3(0,0,-3);
    vec3 ray = normalize(vec3(uu, 1));

    const float count = 30.;
    float index = count;
    for (index; index > 0.; --index) {
        float dist = map(pos);
        if (dist < .001) break;
        dist *= 0.9 + 0.1 * rng.z;
        pos += ray * dist;
    }

    if (index != count) {
        float m = mat;
        vec2 off=vec2(0.001,0); // compute normal by NuSan (https://www.shadertoy.com/view/3sBGzV)
        vec3 normal = normalize(map(pos)-vec3(map(pos-off.xyy), map(pos-off.yxy), map(pos-off.yyx)));
        float shade = index/count;
        color.rgb = colorize(pos, normal, ray, m)*shade;
    
        ray = reflect(ray, normal);
        vec3 rough = tan(normalize(rng*2.-1.));
        ray = normalize(ray + rough*.1);
        pos += ray*0.1;
        index = 30.;
        for (index; index > 0.; --index) {
            float dist = map(pos);
            if (dist < .001) break;
            dist *= 0.9 + 0.1 * rng.z;
            pos += ray * dist;
        }
    
        m = mat;
        normal = normalize(map(pos)-vec3(map(pos-off.xyy), map(pos-off.yxy), map(pos-off.yyx)));
        color.rgb += colorize(pos, normal, ray, m)*shade*index/count;
    }

    // color = mix(color, texture(framebuffer, gl_FragCoord.xy/resolution.xy), 0.97);
    // if (tick > 3.) {
        color = clamp(color, 0., 1.);
        color = max(color, texture(framebuffer, uv));
    // }
    color.rgb *= fade;
}

`+"";