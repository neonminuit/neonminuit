
import { ray_foot, ray_head } from "./ray.js";

const glsl = x => x;

export const fractal3 = ray_head + glsl`

vec3 cam = vec3(0,0,-3);
float fov = 1.5;
float volume_bias = .001;
float normal_bias = .001;
const float countFrame = 20.;
const float countRaymarch = 20.;
const float countReflections = 0.;
const float frameMode = FRAME_MAX;

float map (vec3 p) {
    vec3 pp = p;
    p = p.yxz;
    p.yz *= rot(round);
    p.xz *= rot(sin(round));
    float t = round + seed + rng.x*0.5;
    vec3 angle = vec3(.1,-.1,.1)+t;//(t*2.+p*1.9);
    float size = 1.+rng.x*rng.x*2.;//sin(rng.x*3.14);
    float range = .3+.5*rng.x;
    const float count = 4.;
    float a = 1.0;
    float scene = 1000.;
    float shape = 1000.;
    for (float index = 0.; index < count; ++index)
    {
        p.xz = abs(p.xz)-range*a;
        p.yx *= rot(sin(angle.x/a)*1.);
        p.zx *= rot(sin(angle.z/a)*1.);
        p.yz *= rot(sin(angle.y/a)*2.);
        shape = length(p)-0.1*a*size;
        mat = mix(mat, float(index), smoothing(shape, scene, 0.3*a));
        scene = smin(scene, shape, .1*a);
        a /= 1.9;
    }
    // scene = max(abs(scene)-.001, -(length(pp-cam)-1.5));
    return scene;
}

vec3 colorize (vec3 p, vec3 n, vec3 r, float m) {
    
    // Inigo Quilez color palette (https://iquilezles.org/www/articles/palettes/palettes.htm)
    vec3 tint = vec3(.5)+vec3(.5)*cos(vec3(3,2,1)+length(p)*2.+round*3.);

    float ld = dot(reflect(r, n), vec3(0,1,0))*0.5+0.5;
    vec3 light = vec3(1.000,1.000,1.000) * pow(ld, 2.) * 0.5;
    ld = dot(reflect(r, n), vec3(0,-1,0))*0.5+0.5;
    light += vec3(0.859,0.122,0.455) * pow(ld, 0.5)*.5;
    
    // pixel color
    return (tint + light);// * shade;//pow(shade, 1.3);
    
}

`+ray_foot+"";