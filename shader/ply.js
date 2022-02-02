
const glsl = x => x;

export const ply_vertex = glsl`

attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;
attribute vec2 anchor;
uniform mat4 perspective;
uniform vec2 resolution;
varying vec2 uv;
varying vec3 v_color;

void main()
{
    uv = anchor*.5+.5;
    vec3 p = position.xyz;
    gl_Position = perspective * vec4(p, 1);
    gl_Position.xy += anchor * 5. / resolution;
    v_color = color;
}
`+""

export const ply_pixel = glsl`

precision mediump float;
varying vec2 uv;
varying vec3 v_color;

void main()
{
    gl_FragColor = vec4(v_color, 1);
}
`+"";