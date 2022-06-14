

const glsl = x => x;

export const shaderCursorVertex = glsl`

    attribute vec4 position;
    attribute vec2 texcoord;
    uniform mat4 matrix;
    uniform vec3 colorPicked;
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

         // black or white
        vec3 tint = vec3(step(0.5, texcoord.x));

        // color picked
        if (texcoord.y > 1.) {
            // tint = colorPicked;
            float colorOffset = cursor.x*6.28+1.5;
            tint = 0.5 + 0.5 * cos(vec3(0,.3,.6)*6.28+colorOffset);
        }

        color = vec4(tint, 1);
    }
`

export const shaderCursorPixel = glsl`

    varying vec4 color;

    void main()
    {
        gl_FragColor = vec4(color.rgb, 1);
    }
`