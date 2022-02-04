
import * as twgl from '../lib/twgl-full.module.js'
import { points_vertex, ply_color, ply_vertex } from '../../shader/shader_points.js'
import { pixel_frame, pixel_filter } from '../../shader/shader_frame.js'
import { points } from '../module/points.js'
import { frame } from '../module/frame.js'
import { buffer } from '../module/buffer.js'
import { events } from '../module/events.js'
import { camera } from '../module/camera.js'
import { gizmo } from '../module/gizmo.js'
import { persistent } from '../module/persistent.js'
const prim = twgl.primitives;
const m4 = twgl.m4;

export function simple (canvas)
{
    // webgl components
    const gl = canvas.getContext("webgl2");
    const shader_points = twgl.createProgramInfo(gl, [points_vertex, ply_color]);
    const shader_ply = twgl.createProgramInfo(gl, [ply_vertex, ply_color]);
    const screen = frame(gl, pixel_frame);
    const filter = frame(gl, pixel_filter);
    const framebuffer = buffer(gl);

    // const cursor = frame(gl);
    let cursor = gizmo(gl);
    let ply = points(gl, shader_points, 10000, [1,1]);

    // load point cloud
    const plyName = 'Garnier';
    const loader = new THREE.PLYLoader();
    loader.load( './ply/'+plyName+'.ply', function ( geometry ) {
        const count = geometry.attributes.position.array.length/3;
        // ply = points(gl, shader_ply, count, [1,1], geometry.attributes);
    });


    // events
    events.hook(canvas);

    // global uniforms
    const uniforms = {
        time: 0,
        resolution: [canvas.width, canvas.height],
        world: m4.identity(),
        viewProjection: 0,
        framebuffer: 0,
        frameColor: 0,
        frameNormal: 0,
        frameDepth: 0,
        blueNoiseMap: twgl.createTexture(gl, { src: "image/bluenoise_shadertoy.png" } ),
    };

    // time parameters
    let tick = 0;

    // main loop
    function render(time) {
        requestAnimationFrame(render);

        // resize canvas and frames
        if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
            uniforms.resolution = [gl.canvas.width, gl.canvas.height];
            twgl.resizeFramebufferInfo(gl, framebuffer.fbo, framebuffer.attachments);
            camera.aspect = gl.canvas.width / gl.canvas.height;
        }

        events.update();
        camera.update();

        // uniforms
        uniforms.time = time / 1000.;
        uniforms.viewProjection = camera.viewProjection;
        
        // scene
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.fbo.framebuffer);
        // uniforms.world = m4.translation([0,.1,0]);//[data[0],data[1],data[2]]);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        ply(uniforms);
        
        // filter
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST);
        uniforms.frameDepth = framebuffer.fbo.attachments[0];
        uniforms.frameNormal = framebuffer.fbo.attachments[1];
        uniforms.frameColor = framebuffer.fbo.attachments[2];
        filter(uniforms);
        
        // read pixels
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.fbo.framebuffer);
        const pixelX = events.mouseViewport[0] * gl.canvas.width / gl.canvas.clientWidth;
        const pixelY = gl.canvas.height - events.mouseViewport[1] * gl.canvas.height / gl.canvas.clientHeight - 1;
        const data = new Float32Array(4);
        gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.FLOAT, data);
        // console.log(data[0]);


        // debug
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        framebuffer.fbo.attachments.forEach((frame, i) => {
            uniforms.framebuffer = frame;
            screen(uniforms, [.2*i,0,.2,.2]);
        });
        
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        cursor(uniforms);

        if (events.leftPressed) {
            camera.target = [data[0], data[1], data[2]];
            camera.from = camera.eye;
        }

        let pos = [data[0], data[1], data[2]];
        uniforms.world = m4.translation(pos);
        // let pick = m4.getTranslation(m4.multiply((camera.viewProjection), m4.translation(pos)));
        // // pick = [data[0]/data[2],data[1]/data[2]];
        // const x = pick[0]*.5+.5;
        // const y = pick[1]*.5+.5;
        // const size = 0.02;
        // cursor(uniforms, [x-size,y-size,size*2,size*2]);
        
        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
        Object.keys(persistent).forEach((key) => localStorage.setItem(key, persistent[key]));
        events.endOfFrame();
        tick++;
    }

    requestAnimationFrame(render);
}