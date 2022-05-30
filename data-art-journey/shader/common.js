
const glsl = x => x;

const common = glsl`
precision mediump float;

mat2 rot (float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

// Dave Hoskins
// https://www.shadertoy.com/view/4djSRW
float hash11(float p) {
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}
float hash12(vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 hash21(float p) {
    vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}
vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);

}

// Inigo Quilez
// https://iquilezles.org/articles/distfunctions
float smin( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

float smoo(float d1, float d2, float k) {
    return clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
}

float luminance(vec3 c) { return (c.r+c.g+c.b)/3.; }

#define repeat(p,r) (mod(p,r)-r/2.)
#define ss(a,b,t) smoothstep(a,b,t)

`+""