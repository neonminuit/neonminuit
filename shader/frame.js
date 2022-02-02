
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
uniform sampler2D frameAO;
varying vec2 uv;

void main()
{
    gl_FragColor = texture2D(frameAO, uv);
}
`+"";