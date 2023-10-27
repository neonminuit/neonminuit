
import * as twgl from '../lib/twgl-full.module.js'

export function buffer(gl)
{
    gl.getExtension("EXT_color_buffer_float");
    // var attachments = [
    //     { type: gl.FLOAT, minMag: gl.NEAREST },
    //     { format: gl.DEPTH_STENCIL },
    // ]
    
    // var attachments = [{ type: gl.FLOAT, minMag: gl.NEAREST }]
    // console.log(gl.RGBA32F);
    var attachments = [
        { internalFormat:gl.RGBA32F, minMag: gl.NEAREST, wrap: gl.CLAMP_TO_EDGE },
        { internalFormat:gl.RGBA32F, minMag: gl.NEAREST, wrap: gl.CLAMP_TO_EDGE },
        { internalFormat:gl.RGBA32F, minMag: gl.NEAREST, wrap: gl.CLAMP_TO_EDGE },
        // { type: gl.FLOAT, minMag: gl.NEAREST },
        { format: gl.DEPTH_STENCIL },
    ]
//     const attachments = [
//   { format: gl.RGB565, mag: gl.NEAREST },
//   { format: gl.STENCIL_INDEX8 },
// ]

    return {
        fbo: twgl.createFramebufferInfo(gl, attachments),
        attachments: attachments
    };
}