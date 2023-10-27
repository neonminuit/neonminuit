
import { ray_foot, ray_head } from "./ray.js";

const glsl = x => x;

export const fractal2 = ray_head + glsl`

vec3 cam = vec3(0,0,-3);
float fov = 1.;
float volume_bias = .001;
float normal_bias = .001;
const float countFrame = 3.;
const float countRaymarch = 50.;
const float countReflections = 50.;
const float frameMode = FRAME_MIX;

float map (vec3 p) {
    vec3 pp = p;
    float dist = 100.;
    float shape = 100.;
    float t = 1.0+round+seed;
    float r = 1. + .2 * prm.x;
    float f = 1.9 + .2 * prm.y;
    float s = 1.;
    float a = 1.0;
    const float count = 5.;
    for (float i = 0.; i < count; ++i) {
        p = abs(p)-r*a;
        p.xy *= rot(t/a);
        p.xz *= rot(t/a);
        shape = length(p)-s*a;
        mat = shape < dist ? i : mat;
        dist = min(dist, shape);
        a /= f;
    }
    lpos = p;
    shape = length(p.xy)-.001;
    shape = min(shape, min(length(p.xz)-.001, length(p.zy)-.001));
    mat = shape < dist ? -1. : mat;
    dist = min(dist, shape);
    // dist = max(abs(dist), -(length(pp-cam)-.5));
    return dist;
}

vec3 colorize (vec3 p, vec3 n, vec3 r, float m) {
    float dp = length(p);
    vec3 tint = .5 + .5 * cos(vec3(0,.3,.6)*6.+lpos.z*3.+dp*3.);
    // tint *= 2.;
    if (m >= 0.) tint = vec3(0);
    // if (mod(m, 2.) <= 0.5) tint = vec3(0);
    tint += pow(dot(reflect(r,n), vec3(0,0,1))*.5+.5, 10.);
    return tint;
}

`+ray_foot+"";