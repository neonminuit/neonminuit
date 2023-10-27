
const glsl = x => x;

export const sdf = glsl`

float map (vec3 p);

// Inigo Quilez https://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
float sdBox( vec3 p, vec3 b )
{
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdCappedTorus(in vec3 p, in float an, in float ra, in float rb)
{
    vec2 sc = vec2(sin(an),cos(an));
    p.x = abs(p.x);
    float k = (sc.y*p.x>sc.x*p.y) ? dot(p.xy,sc) : length(p.xy);
    return sqrt( dot(p,p) + ra*ra - 2.0*ra*k ) - rb;
}

float smin( float d1, float d2, float k )
{
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

float smoothing(float d1, float d2, float k)
{
    return clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
}

float ssub( float d1, float d2, float k )
{
    float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
    return mix( d2, -d1, h ) + k*h*(1.0-h);
}

float smax( float d1, float d2, float k )
{
    float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) + k*h*(1.0-h);
}

// NuSan (https://www.shadertoy.com/view/3sBGzV)
vec3 getNormal (vec3 pos) {
    vec2 noff = vec2(0.001,0);
    return normalize(map(pos)-vec3(map(pos-noff.xyy), map(pos-noff.yxy), map(pos-noff.yyx)));
}

// Inigo Quilez (https://www.shadertoy.com/view/Xds3zN)
float getAO( in vec3 pos, in vec3 nor, in float scale) {
	float occ = 0.0;
    float sca = 1.0;
    for( int i=0; i<5; i++ ) {
        float h = 0.01 + scale*float(i)/4.0;
        float d = map( pos + h*nor );
        occ += (h-d)*sca;
        sca *= 0.95;
        if( occ>0.35 ) break;
    }
    return clamp( 1.0 - 3.0*occ, 0.0, 1.0 );// * (0.5+0.5*nor.y);
}

`+"";