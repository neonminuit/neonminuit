
const glsl = x => x;

export const palette = glsl`

vec3 palette (float t) {
    // return .5+.5*cos(vec3(0,.3,.6)*6. + t);
    return .5+.5*cos(vec3(1,2,3)*.5 + t);
}

`+"";