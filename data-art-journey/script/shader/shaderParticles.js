

const glsl = x => x;

export const shaderParticlesVertex = glsl`

    attribute vec4 position;
    attribute vec2 texcoord;
    attribute vec2 quantity;
    uniform float time, fadeIn, fadeOut, jump, blackOut;
    uniform vec2 resolution;
    uniform sampler2D frame;
    varying vec2 uv;
    varying vec3 tint;

    void main()
    {
        float speed = 0.2;
        float t = hash11(quantity.x) * jump + time * speed;
        float anim = fract(t);
        float index = floor(t);
        float fade = sin(anim*3.14);

        vec3 pos = (hash31(quantity.x + index)*2.-1.);
        pos *= vec3(.5,.25, .001);
        tint = texture2D(frame, pos.xy * 0.5 + 0.5).rgb;

        float size = 0.01 * fade * ss(0.1, 0.5, luminance(tint)) * (1.-blackOut) * jump;
        pos.z -= anim * jump;// * (sin(time)*.5+.5);
        pos += sin(pos*10.+time) * .05 * jump;

        vec2 p = texcoord * vec2(resolution.y/resolution.x, 1);
        pos.xy += (p * 2.-1.) * size * vec2(1,-1);
        pos.xy /= 1.+pos.z;
        gl_Position = vec4(pos, 1);
        // tint = vec3(0.5+0.5*cos(vec3(1,2,3)+hash11(quantity.x)*6.));
        uv = texcoord*2.-1.;
    }
`

export const shaderParticlesPixel = glsl`

    varying vec3 tint;
    varying vec2 uv;

    void main()
    {
        float dist = length(uv);
        if (dist > 1.) discard;
        vec3 normal = normalize(vec3(-uv, 1.-dist*dist));
        vec3 lightDir = normalize(vec3(0,1,1));
        float shade = dot(normal, lightDir)*0.5+0.5;
        float light = pow(dot(reflect(vec3(0,0,1), normal), lightDir)*0.5+0.5, 4.0);
        vec3 color = tint * shade + light * 0.5;
        gl_FragColor = vec4(color, 1);
    }
`