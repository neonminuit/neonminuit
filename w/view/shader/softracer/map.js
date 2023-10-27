

const glsl = x => x;

export const map = glsl`

float kif (vec3 p, float angle, float range, float size, float falloff)
{
    float dist = 100.;
    float shape = 100.;
    float a = 1.0;
    const float count = 8.;
    for (float i = 0.; i < count; ++i) {
        p.x = abs(p.x)-range*a;
        p.xz *= rot(angle/a);
        p.yx *= rot(angle/a);
        p.yz *= rot(angle/a);
        p.y += sin(8.*angle/a)*a*.1;
        shape = length(p)-size*a;
        // shape = max(length(p)-s*.1, abs(p.y));
        // shape = sdBox(p, vec3(s*a,s*a*2.,.001));
        material = shape < dist ? i/count : material;
        // material = mix(material, i, smoothing(shape, dist, b*a));
        // dist = smin(dist, shape, b*a);
        dist = min(dist, shape);
        a /= falloff;
    }
    return dist;
}

float map(vec3 p)
{
    float dist = 100.;
    float shape = 100.;
    float round = floor(time/delay);
    // float lp = length(p);
    vec3 pp = p;
    material = 0.;

    float seed = 20.;
    float stretch = 2. * rng.x;
    float steps = 20.;
    float angle = seed + stretch;
    float range = .5;
    // float mask = smoothstep(.5,-1.,p.y);
    float size = .1;//*(.75+.25*sin(rng.x*6.28*10.));
    float ssize = .1;//*(1.-rng.x);
    float blend = .01;
    float falloff = 1.6;
    float sinFreq = 8.;
    float sinStrength = .05;
    const float count = 8.;
    
    float a = 1.;
    for (float i = 0.; i < count; ++i) {
        p.x = abs(p.x)-range*a;
        p.xz *= rot(angle/a);
        p.yx *= rot(angle/a);
        p.yz *= rot(angle/a);
        p.y += sin(sinFreq*angle/a)*a*sinStrength;
        shape = length(p)-size*a;
        // shape = sdCappedTorus(p, 1.5, .1, size*a);
        // material = shape < dist ? i/count : material;
        material = mix(i/count, material, smoothing(shape, dist, .2));
        dist = min(dist, shape);
        a /= falloff;
    }
    angle = seed + floor(stretch*steps)/steps;
    a = 1.;
    p = pp;
    float spheres = 100.;
    float mat = 0.;
    for (float i = 0.; i < count; ++i) {
        p.x = abs(p.x)-range*a;
        p.xz *= rot(angle/a);
        p.yx *= rot(angle/a);
        p.yz *= rot(angle/a);
        p.y += sin(sinFreq*angle/a)*a*sinStrength;
        vec3 ppp = p;
        // ppp.xz *= rot(rng.y/a);
        // ppp.x += rng.y*a*.5;
        // ppp.z += size*2.;
        // ppp.x = abs(ppp.x)-.05*a;
        shape = length(ppp)-ssize*a;
        // shape = sdCappedTorus(p, 5.5*a, .5*a, ssize*a);
        // mat = shape < spheres ? i/count : mat;
        mat = mix(i/count, mat, smoothing(shape, spheres, .2));
        spheres = min(spheres, shape);
        a /= falloff;
    }
    // material = spheres < dist ? mat : material;
    material = mix(mat, material, smoothing(spheres, dist, .2));
    // material = spheres < dist ? -rng.x : rng.x;
    // material = rng.x;
    dist = smin(dist, spheres, blend);
    // dist = max(dist, -(length(pp-camera)-.3));
    // dist = ssub((length(pp-camera)-.1), dist, .6);
    return dist;
}

`+"";