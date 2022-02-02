
import * as twgl from './twgl-full.module.js'
import { particles } from './particles.js'
import { camera } from './camera.js'
import { frame_vertex, frame_pixel } from '../shader/frame.js'
import { ply_vertex, ply_pixel, ply_depth } from '../shader/ply.js'
import { ao_pixel } from '../shader/ao.js'
const m4 = twgl.m4;
const glsl = x => x;

export function viewer (canvas)
{
    // webgl components
    const gl = canvas.getContext("webgl");
    const shaderPoints = twgl.createProgramInfo(gl, [ply_vertex, ply_depth]);
    const shaderAO = twgl.createProgramInfo(gl, [frame_vertex, ao_pixel]);
    const shaderFrame = twgl.createProgramInfo(gl, [frame_vertex, frame_pixel]);
    const plane = twgl.createBufferInfoFromArrays(gl, { position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0] });
    
    gl.getExtension("OES_texture_float");
    // gl.getExtension("OES_texture_float_linear");
    var frameOptions = [{ type: gl.FLOAT, minMag: gl.NEAREST }]
    var frameDepthOptions = [{ type: gl.FLOAT, minMag: gl.NEAREST }, { format: gl.DEPTH_STENCIL }]
    const frameDepth = twgl.createFramebufferInfo(gl, frameDepthOptions);
    const framesAO = [twgl.createFramebufferInfo(gl, frameOptions),twgl.createFramebufferInfo(gl, frameOptions)];
    const frames = [ framesAO ].flat();
    
    // loop parameters
    let settings = {
        update: true,
        free: false,
        mouse: [0, 0],
        clic: false,
        wheel: 0,
    };
    
    // time parameters
    let tick = 0;
    let elapsed = 0;
    let last = 0;

    // shader uniforms
    let parameters = {
        time: 0,
        resolution: [canvas.width, canvas.height],
        framebuffer: 0,
        frameDepth: 0,
        frameAO: 0,
        temporal: 0,
        
        // maps
        blueNoiseMap: twgl.createTexture(gl, { src: "image/bluenoise_shadertoy.png" } ),
    };
    
    // plys
    let points = null;
    const loader = new THREE.PLYLoader();
    loader.load( './ply/MEC_Foreuse_200K.ply', function ( geometry ) {
        let p = particles({
            position: geometry.attributes.position.array,
            normal: geometry.attributes.normal.array,
            color: geometry.attributes.color.array,
        }, [1,1]);
        points = [];
        for (let index = 0; index < p.length; index++) {
            points.push(twgl.createBufferInfoFromArrays(gl, p[index]));
        }
    } );

    // camera
    let cam = camera();
    let aspect = gl.canvas.width / gl.canvas.height;

    // main loop
    function render(time) {

        // firt frame
        if (tick == 0) {
            last = time / 1000;
        }

        if (settings.update) {

            // resize canvas and frames
            if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
                parameters.resolution = [gl.canvas.width, gl.canvas.height];
                frames.forEach(frame => twgl.resizeFramebufferInfo(gl, frame, frameOptions));
                twgl.resizeFramebufferInfo(gl, frameDepth, frameDepthOptions);
                aspect = gl.canvas.width / gl.canvas.height;
            }
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            // time
            let dt = time / 1000 - last;
            elapsed += dt;
            parameters.time = elapsed;
            
            let mouse = { x: 0, y: 0 };
            mouse.x = ((settings.mouse[0]/gl.canvas.width)*2.-1.)*aspect;
            mouse.y = (settings.mouse[1]/gl.canvas.width)*2.-1.;

            parameters.perspective = cam(aspect, mouse, settings.clic, settings.wheel, dt);
            
            if (settings.clic || settings.wheel != 0) {
                parameters.temporal = 0;
            } else {
                parameters.temporal = 1;
            }

            settings.wheel = 0;

            // render
            // if (points == null) {
            //     gl.useProgram(shader.program);
            //     twgl.setBuffersAndAttributes(gl, shader, plane);
            //     twgl.setUniforms(shader, parameters);
            //     twgl.drawBufferInfo(gl, plane);
            // } else {
            if (points != null) {

                // draw points depth into frame
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameDepth.framebuffer);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.useProgram(shaderPoints.program);
                twgl.setUniforms(shaderPoints, parameters);
                for (let index = 0; index < points.length; index++) {
                    const p = points[index];
                    twgl.setBuffersAndAttributes(gl, shaderPoints, p);
                    twgl.drawBufferInfo(gl, p);
                }

                parameters.frameDepth = frameDepth.attachments[0];
                parameters.frameAO = framesAO[tick%2].attachments[0];
                
                // gl.disable(gl.DEPTH);
                // ao
                gl.bindFramebuffer(gl.FRAMEBUFFER, framesAO[(tick+1)%2].framebuffer);
                // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.useProgram(shaderAO.program);
                twgl.setUniforms(shaderAO, parameters);
                twgl.setBuffersAndAttributes(gl, shaderAO, plane);
                twgl.drawBufferInfo(gl, plane);
                
                // draw final image
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.useProgram(shaderFrame.program);
                twgl.setBuffersAndAttributes(gl, shaderFrame, plane);
                twgl.setUniforms(shaderFrame, parameters);
                twgl.drawBufferInfo(gl, plane);
            }
            
            tick++;
        }

        // looping
        if (!settings.free) {
            last = time / 1000;
            requestAnimationFrame(render);
        }
    }

    requestAnimationFrame(render);

    return settings;
}