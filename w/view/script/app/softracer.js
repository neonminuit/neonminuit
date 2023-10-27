
import * as twgl from './twgl-full.module.js'
import { vertex } from '../shader/vertex.js'
import { common } from '../../shader/common.js'
import { raymarch } from '../../shader/softracer/raymarch.js'
import { map } from '../../shader/softracer/map.js'
import { normalize } from '../../shader/softracer/normalize.js'
import { ao } from '../../shader/softracer/ao.js';
import { palette } from '../../shader/softracer/palette.js'
import { colorize } from '../../shader/softracer/colorize.js'

const glsl = x => x;
const m4 = twgl.m4;

export function softracer (canvas, pixelShader)
{
    // webgl component
    const gl = canvas.getContext("webgl");

    // shaders
    const shaderDepth = twgl.createProgramInfo(gl, [vertex, common+raymarch+map]);
    const shaderNormal = twgl.createProgramInfo(gl, [vertex, common+normalize]);
    const shaderAO = twgl.createProgramInfo(gl, [vertex, common+ao]);
    const shaderColorize = twgl.createProgramInfo(gl, [vertex, common+palette+colorize]);

    // mesh plane
    const plane = twgl.createBufferInfoFromArrays(gl, { position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0] });
    
    // frame buffer float
    gl.getExtension("OES_texture_float");
    gl.getExtension("OES_texture_float_linear");
    var frameOptions = [{ type: gl.FLOAT, minMag: gl.LINEAR }]
    const framesDepth = [twgl.createFramebufferInfo(gl, frameOptions),twgl.createFramebufferInfo(gl, frameOptions)];
    const framesNormal = [twgl.createFramebufferInfo(gl, frameOptions),twgl.createFramebufferInfo(gl, frameOptions)];
    const framesAO = [twgl.createFramebufferInfo(gl, frameOptions),twgl.createFramebufferInfo(gl, frameOptions)];
    const frames = [ framesDepth, framesNormal, framesAO ].flat();

    let settings = {
        update: true,
        free: false,
    };

    // time
    let tick = 0;
    let elapsed = 0;
    let last = 0;

    let parameters = {
        // the classics
        time: 0,
        resolution: [canvas.width, canvas.height],
        mouse: [0, 0],

        // camera
        camera: [0,0,-3],
        fov: 30,
        nearClip: 0.01,
        farClip: 5,

        // animation
        delay: 10,

        // frame buffers
        frameDepth: 0,
        frameNormal: 0,
        frameAO: 0,

        // maps
        blueNoiseMap: twgl.createTexture(gl, { src: "image/bluenoise_shadertoy.png" } ),
        frameMap: twgl.createTexture(gl, { src: "image/frame.png" } ),
    };

    let aspect = 1;

    function render(time)
    {
        // first frame
        if (tick == 0) {
            last = time / 1000;
        }
        
        if (settings.update) {

            // time
            let dt = time / 1000 - last;
            elapsed += dt;
            parameters.time = elapsed;

            // resize
            if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
                frames.forEach(frame => twgl.resizeFramebufferInfo(gl, frame, frameOptions));
                parameters.resolution = [gl.canvas.width, gl.canvas.height];
                aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            }

            // camera
            const p = parameters;
            const projection = m4.perspective(p.fov * Math.PI / 180, aspect, p.nearClip, p.farClip);
            const eye = [1, 0, -1.5];
            const target = [.0, .0, 0];
            const up = [0, 1, 0];

            // eye[0] = Math.cos(elapsed*.01)*3.;
            // eye[2] = Math.sin(elapsed*.01)*3.;

            const camera = m4.lookAt(eye, target, up);
            const view = m4.inverse(camera);
            const viewProjection = m4.multiply(projection, view);
            const world = m4.identity();
                    
            parameters.viewInverse = camera;
            parameters.projectionInverse = m4.inverse(projection);
            parameters.world = world;
            parameters.worldInverseTranspose = m4.transpose(m4.inverse(world));
            parameters.worldViewProjection = m4.multiply(viewProjection, world);


            // reading frames
            parameters.frameDepth = framesDepth[tick%2].attachments[0];
            parameters.frameNormal = framesNormal[tick%2].attachments[0];
            parameters.frameAO = framesAO[tick%2].attachments[0];

            // writing frames
            draw(shaderDepth, framesDepth[(tick+1)%2].framebuffer);
            draw(shaderNormal, framesNormal[(tick+1)%2].framebuffer);
            draw(shaderAO, framesAO[(tick+1)%2].framebuffer);

            // final image
            draw(shaderColorize, null);
            
            tick++;
        }

        // looping
        if (!settings.free) {
            last = time / 1000;
            requestAnimationFrame(render);
        }
    }

    function draw(shader, buffer) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.useProgram(shader.program);
        twgl.setBuffersAndAttributes(gl, shader, plane);
        twgl.setUniforms(shader, parameters);
        twgl.drawBufferInfo(gl, plane);
    }

    requestAnimationFrame(render);

    return { settings, parameters };
}