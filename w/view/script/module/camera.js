
import * as twgl from '../lib/twgl-full.module.js'
import { events } from './events.js'
import { persistent } from './persistent.js'
const m4 = twgl.m4;

export const camera = {

    // coordinates
    eye: [0,0,-1],
    target: [0,0,0],
    from: [0,0,-1],
    up: [0,1,0],
    aspect:  1,
    
    // matrix
    view: m4.identity(),
    projection: m4.identity(),
    viewProjection: m4.identity(),
    orbit: m4.translation([0,0,1.5]),
    world: m4.identity(),

    // orbit
    // orbit_rotation: [0,0],//persistent.orbit_rotation,
    // orbit_distance: 1.5,//persistent.orbit_distance,

    // time
    elapsed: 0.,
    last: 0.,
    dt: 0.,

    zoomSpeed: 5,
    
    update: function() {

        const c = camera;
        
        // time
        if (c.elapsed === 0) c.last = Date.now();
        c.elapsed = Date.now()/1000.;
        c.dt = c.elapsed - c.last;
        c.last = c.elapsed;

        // world
        c.world = m4.translation([0,0,0]);
        
        // mouse
        if (events.clic && events.clicLeft) {
            // let orbit = m4.lookAt(c.eye, c.target, c.up);
            // c.orbit = m4.translate(c.orbit, [-c.eye[0],-c.eye[1],-c.eye[2]]);
            c.orbit = m4.translate(c.orbit, [0,0,-1.5]);
            c.orbit = m4.translate(c.orbit, c.target);
            c.orbit = m4.rotateX(c.orbit, -events.mouse_dt[1]*1.5);
            c.orbit = m4.rotateY(c.orbit, -events.mouse_dt[0]*1.5);
            c.orbit = m4.translate(c.orbit, [0,0,1.5]);
            // c.orbit = m4.translate(c.orbit, c.eye);
            c.orbit = m4.translate(c.orbit, [-c.target[0],-c.target[1],-c.target[2]]);
            // c.orbit = m4.translate(c.orbit, [0,0,-1.5]);
            // let offset = m4.getTranslation(orbit);
            
            // offset[0] = offset[0] - c.eye[0];
            // offset[1] = offset[1] - c.eye[1];
            // offset[2] = offset[2] - c.eye[2];
            // console.log(offset);
        }
        if (events.wheel < 0) {
            c.orbit = m4.translate(c.orbit, [0,0,c.dt*c.zoomSpeed]);
        } else if (events.wheel > 0) {
            c.orbit = m4.translate(c.orbit, [0,0,c.dt*-c.zoomSpeed]);
        }
        // persistent.orbit_rotation = c.orbit_rotation;
        // persistent.orbit_distance = c.orbit_distance;

        // orbit
        // c.orbit = m4.identity();
        // c.orbit = m4.translation((c.target));

        // world view projection matrix
        c.eye = m4.getTranslation(c.orbit);
        c.view = m4.inverse(c.orbit);//m4.lookAt(c.eye, c.target, c.up));
        c.projection = m4.perspective(60 * Math.PI / 180, c.aspect, .01, 100.);
        c.viewProjection = m4.multiply(m4.multiply(c.projection, c.view), c.world);
    },
}