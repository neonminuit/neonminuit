
import { ray_foot, ray_head } from "./ray.js";

const glsl = x => x;

export const fractal = ray_head + glsl`

vec3 cam = vec3(0,0,-3);
float fov = .5;
float volume_bias = .001;
float normal_bias = .001;
const float countFrame = 1.;
const float countRaymarch = 60.;
const float countReflections = 0.;
const float frameMode = FRAME_MAX;

float map (vec3 pos) {
    pos.z += round;
    float chilly = noise(pos * 2.);
    float salty = fbmNoise(pos*20.);
    
    pos.z -= salty*.04;
    salty = smoothstep(.3, 1., salty);
    pos.z += salty*.04;
    pos.xy -= (chilly*2.-1.) * .2;
        
    vec3 p = pos;
    vec2 cell = vec2(1., .5);
    vec2 id = floor(p.xz/cell);
    p.xy *= rot(id.y * .5);
    p.y += sin(p.x + .5);
    p.xz = repeat(p.xz, cell);
        
    vec3 pp = p;
    moda(p.yz, 5.0);
    p.y -= .1;
    float scene = length(p.yz)-.02;
    float shape = 100.;
    mat = 0.;
        
    vec3 ppp = pos;
    pp.xz *= rot(pp.y * 5.);
    ppp = repeat(ppp, .1);
    moda(pp.xz, 3.0);
    pp.x -= .04 + .02*sin(pp.y*5.);
    shape = length(pp.xz)-.01;
    mat = shape < scene ? 1. : mat;
    scene = smin(shape, scene, .2);

    p = pos;
    p.xy *= rot(-p.z);
    moda(p.xy, 8.0);
    p.x -= .7;
    p.xy *= rot(p.z*8.);
    p.xy = abs(p.xy)-.02;
    shape = length(p.xy)-.005;
    mat = shape < scene ? 2. : mat;
    scene = smin(scene, shape, .2);
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