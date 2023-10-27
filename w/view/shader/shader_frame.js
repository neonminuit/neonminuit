
const glsl = x => x;

export const vertex_fullscreen = glsl`#version 300 es

in vec2 texcoord;
out vec2 uv;

void main()
{
    uv = texcoord;
    gl_Position = vec4(texcoord * 2. - 1., 0, 1);
}

`+"";

export const pixel_uv = glsl`#version 300 es

precision mediump float;
in vec2 uv;
layout(location = 0) out vec4 color;

void main()
{
    color = vec4(uv, 0, 1);
}

`+"";

export const pixel_frame = glsl`#version 300 es

precision mediump float;
uniform sampler2D framebuffer;
in vec2 uv;
layout(location = 0) out vec4 color;

void main()
{
    color = vec4(texture(framebuffer, uv).rgb, 1);
}

`+"";

export const pixel_filter = glsl`#version 300 es

precision mediump float;
uniform sampler2D frameColor, frameNormal, frameDepth;
uniform mat4 matrix;
in vec2 uv;
layout(location = 0) out vec4 color;

void main()
{
    vec3 pos = texture(frameDepth, uv).xyz;
    color = vec4(fract(abs(pos)*10.), 1);
}

`+"";
