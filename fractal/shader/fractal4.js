
import { ray_foot, ray_head } from "./ray.js";

const glsl = x => x;

export const fractal4 = ray_head + glsl`

vec3 cam = vec3(0,.1,0);
float fov = 0.7;
float volume_bias = .001;
float normal_bias = .001;
const float countFrame = 1.;
const float countRaymarch = 40.;
const float countReflections = 0.;
const float frameMode = FRAME_MAX;

float map (vec3 p) {
    // p = p.yxz;
    p.zy *= rot(-.5);

    // hold space coordinates
    vec3 pp = p;
    
    // distances
    float scene = 1000.;
    float shape = 1000.;
    
    // parameters
    vec3 angle = vec3(1,2,3) + round;
    float range = .2;
    
    // shiny material
    mat = -1.;
    
    // amplitude of kifs
    float a = 1.;
    float falloff = 1.55;//+.05*mouse.y;
    
    // kifs (kaleidoscopic iterated function)
    const float count = 12.;
    for (float index = 0.; index < count; ++index)
    {
        // rotate more and more
        p.xz *= rot(angle.y/a);
        
        // fold and translate
        p = abs(p)-range*a;
        shape = max(p.x, max(p.y, p.z));
        mat = shape < scene ? index : mat;
        // combine to scene
        scene = min(scene, shape);
        
        // falloff
        a /= falloff;
    }
    
    // invert volume
    scene = -scene;
    
    // lines
    // p = pp;
    // p.xz *= rot(196.+round*.3);
    // p.yz *= rot(196.+round*1.7);
    // p = repeat(p, .1);
    // shape = min(scene, length(p.xz)-.001);
    
    // lines material and combine to scene
    // mat = shape < scene ? 1. : mat;
    // scene = min(shape, scene);
    
    return scene;
}

vec3 colorize (vec3 p, vec3 n, vec3 r, float m) {
    
    vec3 color = vec3(0.);
    
    // lines
    // if (m > 0.)
    {
        // color palette by Inigo Quilez (https://iquilezles.org/www/articles/palettes/palettes.htm)
        color = .5+.5*cos(vec3(0, .3, .6)*3.+length(p)*2.+m*.2);
    }
    // else
    // {
    //     color = vec3(.1);
    // }

    float ld = dot(reflect(r, n), vec3(0,1,0))*0.5+0.5;
    vec3 light = vec3(1.000,1.000,1.000) * pow(ld, 2.) * 0.5;
    ld = dot(reflect(r, n), vec3(0,-1,0))*0.5+0.5;
    light += vec3(0.859,0.122,0.455) * pow(ld, 0.5)*.5;

    return color * .5 + light;
    
}

`+ray_foot+"";