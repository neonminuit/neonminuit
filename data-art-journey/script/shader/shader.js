
const glsl = x => x;

export let shader = {

    vertex: glsl`
        attribute vec2 texcoord;
        varying vec2 uv;

        void main() {
            uv = texcoord;
            gl_Position = vec4(texcoord * 2. - 1., 0, 1);
        }

    `,

    pixel: glsl`
        varying vec2 uv;

        void main() {
            gl_FragColor = vec4(uv, 0, 1);
        }

    `,

    mesh: glsl`
        attribute vec4 position;
        uniform mat4 matrix;

        void main()
        {
            gl_Position = matrix * position;
        }
    `,

    color: glsl`

        void main()
        {
            gl_FragColor = vec4(1,0,0,1);
        }
    `,

    common: glsl`
        precision mediump float;
        
        #define repeat(p,r) (mod(p,r)-r/2.)
        #define ss(a,b,t) smoothstep(a,b,t)

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

        vec3 hash31(float p)
        {
            vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
            p3 += dot(p3, p3.yzx+33.33);
            return fract((p3.xxy+p3.yzz)*p3.zyx); 
        }

        vec3 hash33(vec3 p3)
        {
            p3 = fract(p3 * vec3(.1031, .1030, .0973));
            p3 += dot(p3, p3.yxz+33.33);
            return fract((p3.xxy + p3.yxx)*p3.zyx);
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

    `,
}