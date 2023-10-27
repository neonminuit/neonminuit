

import { common } from "./common.js";
const glsl = x => x;


export const gizmos_vertex = "#version 300 es"+common+glsl`

uniform float time;
uniform vec2 resolution;
uniform mat4 viewProjection, world;
in vec3 position;
in vec2 texcoord;
out vec2 v_uv;
out vec3 v_color, v_position;

void main()
{
    vec2 uv = texcoord * 2. - 1.;
    v_color = vec3(texcoord.x,1.-texcoord.y, .5);
    v_uv = uv;
    vec3 pos = vec3(0);
    gl_Position = viewProjection * world * vec4(pos,1);
    gl_Position.xy += vec2(uv.x,-uv.y) * 40. / resolution;
    v_position = gl_Position.xyz;
    // gl_Position.xy += normalize(vec2(offset.y,offset.x)) * 4. / resolution * uv.y;
}

`+"";

export const gizmos_color = "#version 300 es"+glsl`

precision mediump float;
in vec2 v_uv;
in vec3 v_color, v_position;
layout(location = 0)out vec4 depth;
layout(location = 1)out vec4 normal;
layout(location = 2)out vec4 color;

void main()
{
    // if (length(v_uv)>1.) discard;
    color = vec4(1);
    normal = vec4(v_uv, 0.5, 1);
    depth = vec4(v_position, 1);
}

`+"";