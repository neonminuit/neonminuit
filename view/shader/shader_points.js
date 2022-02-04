
import { common } from "./common.js";
const glsl = x => x;

export const points_vertex = "#version 300 es"+common+glsl`

uniform float time;
uniform vec2 resolution;
uniform mat4 viewProjection;
in vec3 position;
in vec2 texcoord, quantity;
out vec2 v_uv;
out vec3 v_color, v_position;

void main()
{
    vec2 uv = texcoord * 2. - 1.;
    v_color = vec3(texcoord.x,1.-texcoord.y, .5);
    v_uv = uv;
    float a = quantity.x * 6.28;
    vec3 pos = vec3(cos(a),sin(a),0) * .5;
    vec3 offset = (hash31(quantity.y*.1)*2.-1.);
    // offset *= rot(uv.x + time);
    pos += offset*.3;
    gl_Position = viewProjection * vec4(pos,1);
    gl_Position.xy += vec2(uv.x,-uv.y) * 100. / resolution;
    v_position = pos.xyz;
    // gl_Position.xy += normalize(vec2(offset.y,offset.x)) * 4. / resolution * uv.y;
}

`+"";

export const ply_vertex = "#version 300 es"+common+glsl`

uniform float time;
uniform vec2 resolution;
uniform mat4 viewProjection;
in vec3 position, ply_position, ply_normal, ply_color;
in vec2 texcoord, quantity;
out vec2 v_uv;
out vec3 v_color, v_position;

void main()
{
    vec2 uv = texcoord * 2. - 1.;
    v_color = ply_color;
    v_uv = uv;
    gl_Position = viewProjection * vec4(ply_position,1);
    gl_Position.xy += vec2(uv.x,-uv.y) * 4. / resolution;
    v_position = ply_position.xyz;
    // gl_Position.xy += normalize(vec2(offset.y,offset.x)) * 4. / resolution * uv.y;
}

`+"";

export const ply_color = glsl`#version 300 es

precision mediump float;
in vec2 v_uv;
in vec3 v_color, v_position;
layout(location = 0)out vec4 depth;
layout(location = 1)out vec4 normal;
layout(location = 2)out vec4 color;

void main()
{
    if (length(v_uv)>1.) discard;
    color = vec4(v_color, 1);
    normal = vec4(v_uv, 0.5, 1);
    depth = vec4(v_position, 1);
}

`+"";

