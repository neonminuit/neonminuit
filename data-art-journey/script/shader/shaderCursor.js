

const glsl = x => x;

export const shaderCursorVertex = glsl`

    attribute vec4 position;
    attribute vec2 texcoord;
    uniform mat4 matrix;
    uniform vec2 cursor;
    uniform float fadeIn, fadeOut;
    varying vec4 color;

    void main()
    {
        vec4 pos = position;
        // if (fade < 0.5) pos.xyz *= (1.-transition);
        pos.xyz *= fadeIn * (1.-fadeOut);
        gl_Position = matrix * pos;
        gl_Position.xy += (cursor * 2. - 1.)*5.;
        color = vec4(step(0.5, texcoord.x));
    }
`

export const shaderCursorPixel = glsl`

    varying vec4 color;

    void main()
    {
        gl_FragColor = vec4(color.rgb, 1);
    }
`