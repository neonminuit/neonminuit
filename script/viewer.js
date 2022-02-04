
import * as twgl from './twgl-full.module.js'
import { particles } from './particles.js'
import { frame_vertex, frame_pixel } from '../shader/frame.js'
import { point_vertex, point_pixel, point_normal_pixel } from '../shader/point.js'
import { filter_pixel } from '../shader/filter.js'
import { persistent } from './persistent.js'
const m4 = twgl.m4;
const glsl = x => x;

export function viewer (canvas, plyName)
{
    // webgl components
    const gl = canvas.getContext("webgl");
    const shaderPoints = twgl.createProgramInfo(gl, [point_vertex, point_pixel]);
    const shaderNormal = twgl.createProgramInfo(gl, [point_vertex, point_normal_pixel]);
    const shaderFilter = twgl.createProgramInfo(gl, [frame_vertex, filter_pixel]);
    const shaderFrame = twgl.createProgramInfo(gl, [frame_vertex, frame_pixel]);
    const plane = twgl.createBufferInfoFromArrays(gl, { position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0] });
    
    gl.getExtension("OES_texture_float");
    var frameOptions = [{ type: gl.FLOAT, minMag: gl.NEAREST }]
    var framePointsOptions = [{ type: gl.FLOAT, minMag: gl.NEAREST }, { format: gl.DEPTH_STENCIL }]
    const framePoints = twgl.createFramebufferInfo(gl, framePointsOptions);
    const frameNormal = twgl.createFramebufferInfo(gl, framePointsOptions);
    const frameFilter = [twgl.createFramebufferInfo(gl, frameOptions),twgl.createFramebufferInfo(gl, frameOptions)];
    const frames = [ frameFilter ].flat();
    
    // time parameters
    let tick = 0;
    let elapsed = 0;
    let last = 0;

    // shader uniforms
    let parameters = {
        time: 0,
        resolution: [canvas.width, canvas.height],
        framePoints: 0,
        frameFilter: 0,
        temporal: 0,
        blueNoiseMap: twgl.createTexture(gl, { src: "image/bluenoise_shadertoy.png" } ),
        matcap: twgl.createTexture(gl, { src: "image/matcap4.png", minMag: gl.LINEAR } ),
    };
    
    // camera
    let eye = [0,0,0];
    let target = [0,0,0];
    let up = [0, 1, 0];
    let aspect =  1;
    let projection = m4.identity();
    let orbit = m4.identity();
    let world = m4.identity();
    let mouse_prev = { x: 0, y: 0 };
    let mouse_dt = { x: 0, y: 0 };
    let mouse_orbit = { x: persistent.mouse_orbit[0], y: persistent.mouse_orbit[1] };
    let orbit_distance = persistent.orbit_distance;
    
    let settings = {
        update: true,
        free: false,
        mouse: [0, 0],
        clic: false,
        clicLeft: false,
        wheel: 0,
        camera: 0,
        perspective: 0,
    };
    
    // plys
    let points = null;
    const loader = new THREE.PLYLoader();
    loader.load( './ply/'+plyName+'.ply', function ( geometry ) {
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
                twgl.resizeFramebufferInfo(gl, framePoints, framePointsOptions);
                twgl.resizeFramebufferInfo(gl, frameNormal, framePointsOptions);
                aspect = gl.canvas.width / gl.canvas.height;
                projection = m4.perspective(60 * Math.PI / 180, aspect, .01, 100.);
            }
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            // time
            let dt = time / 1000 - last;
            elapsed += dt;
            parameters.time = elapsed;
            
            // mouse
            let mouse = { x: 0, y: 0 };
            mouse.x = ((settings.mouse[0]/gl.canvas.width)*2.-1.)*aspect;
            mouse.y = (settings.mouse[1]/gl.canvas.width)*2.-1.;
            mouse_dt.x = mouse.x - mouse_prev.x;
            mouse_dt.y = mouse.y - mouse_prev.y;
            mouse_prev.x = mouse.x;
            mouse_prev.y = mouse.y;
            if (settings.clic && settings.clicLeft) {
                mouse_orbit.x += mouse_dt.x;
                mouse_orbit.y += mouse_dt.y;
            }
            if (settings.wheel < 0) {
                orbit_distance += dt*5;
            } else if (settings.wheel > 0) {
                orbit_distance -= dt*5;
            }

            // camera
            // let orbit_target = m4.identity();
            orbit = m4.identity();
            orbit = m4.rotateY(orbit, -mouse_orbit.x*1.5);
            orbit = m4.rotateX(orbit, -mouse_orbit.y*1.5);
            orbit = m4.translate(orbit, [0,0,orbit_distance]);
            eye = m4.getTranslation(orbit);
            world = m4.translation([0,-.3,0]);
            settings.camera = m4.inverse(m4.lookAt(eye, target, up));
            settings.perspective = m4.multiply(m4.multiply(projection, (settings.camera)), world);

            persistent.mouse_orbit[0] = mouse_orbit.x;
            persistent.mouse_orbit[1] = mouse_orbit.y;
            persistent.orbit_distance = orbit_distance;
            
            Object.keys(persistent).forEach((key) => {
                localStorage.setItem(key, persistent[key])
            })
            
            // temporal
            if ((settings.clic && (Math.abs(mouse_dt.x) > 0. || Math.abs(mouse_dt.y) > 0.)) || settings.wheel != 0) {
                parameters.temporal = 0;
            } else {
                parameters.temporal = 1;
            }

            parameters.perspective = settings.perspective;
            parameters.camera = settings.camera;
            // console.log(parameters.perspective);
            settings.wheel = 0;

            // render
            // if (points == null) {
            //     gl.useProgram(shader.program);
            //     twgl.setBuffersAndAttributes(gl, shader, plane);
            //     twgl.setUniforms(shader, parameters);
            //     twgl.drawBufferInfo(gl, plane);
            // } else {
            if (points != null) {

                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LEQUAL);

                // draw points depth into frame
                gl.bindFramebuffer(gl.FRAMEBUFFER, framePoints.framebuffer);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.useProgram(shaderPoints.program);
                twgl.setUniforms(shaderPoints, parameters);
                for (let index = 0; index < points.length; index++) {
                    const p = points[index];
                    twgl.setBuffersAndAttributes(gl, shaderPoints, p);
                    twgl.drawBufferInfo(gl, p);
                }

                // draw points normal into frame
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameNormal.framebuffer);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.useProgram(shaderNormal.program);
                twgl.setUniforms(shaderNormal, parameters);
                for (let index = 0; index < points.length; index++) {
                    const p = points[index];
                    twgl.setBuffersAndAttributes(gl, shaderNormal, p);
                    twgl.drawBufferInfo(gl, p);
                }

                parameters.framePoints = framePoints.attachments[0];
                parameters.frameFilter = frameFilter[tick%2].attachments[0];
                parameters.frameNormal = frameNormal.attachments[0];
                
                // gl.disable(gl.DEPTH);
                // ao
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameFilter[(tick+1)%2].framebuffer);
                // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.useProgram(shaderFilter.program);
                twgl.setUniforms(shaderFilter, parameters);
                twgl.setBuffersAndAttributes(gl, shaderFilter, plane);
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