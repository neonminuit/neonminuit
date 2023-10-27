
const glsl = x => x;

export const frame_vertex = glsl`

attribute vec4 position;
varying vec2 uv;

void main()
{
    uv = position.xy*.5+.5;
    gl_Position = position;
}
`+"";

export const frame_pixel = glsl`
precision mediump float;
uniform sampler2D frameFilter, framePoints, frameNormal, matcap;
varying vec2 uv;

void main()
{
    gl_FragColor = texture2D(frameFilter, uv);
    gl_FragColor.rgb *= gl_FragColor.a;
    gl_FragColor.a = 1.;

    // vec2 p = uv * 4.;
    // if (p.x > 0. && p.x < 1. && p.y > 0. && p.y < 1.) {
    //     gl_FragColor = texture2D(frameNormal, p);
    // }
    // p.x -= 1.;
    // if (p.x > 0. && p.x < 1. && p.y > 0. && p.y < 1.) {
    //     gl_FragColor = vec4(step(.5, fract(texture2D(framePoints, p).a*20.)));
    // }
    // p.x -= 1.;
    // if (p.x > 0. && p.x < 1. && p.y > 0. && p.y < 1.) {
    //     gl_FragColor = vec4(texture2D(frameFilter, p).a);
    // }
    // p.x -= 1.;
    // if (p.x > 0. && p.x < 1. && p.y > 0. && p.y < 1.) {
    //     gl_FragColor = vec4(texture2D(framePoints, p).xyz, 1);
    // }
    // p.y -= 1.;
    // if (p.x > 0. && p.x < 1. && p.y > 0. && p.y < 1.) {
    //     gl_FragColor = vec4(texture2D(matcap, -p).xyz, 1);
    // }
}
`+"";