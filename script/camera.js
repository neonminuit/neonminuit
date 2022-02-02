
import * as twgl from './twgl-full.module.js'
const m4 = twgl.m4;

let eye = [0,0,0];
let target = [0,0,0];
let up = [0, 1, 0];

let aspect =  1;
let projection = m4.identity();
let orbit = m4.identity();
let world = m4.identity();

let mouse_prev = { x: 0, y: 0 };
let mouse_dt = { x: 0, y: 0 };
let mouse_orbit = { x: 0, y: 0 };
let orbit_distance = 1.5;

export function camera () {

    let update = function(aspect, mouse, clic, wheel, dt) {
        projection = m4.perspective(60 * Math.PI / 180, aspect, .01, 100.);

        mouse_dt.x = mouse.x - mouse_prev.x;
        mouse_dt.y = mouse.y - mouse_prev.y;
        mouse_prev.x = mouse.x;
        mouse_prev.y = mouse.y;

        if (clic) {
            mouse_orbit.x += mouse_dt.x;
            mouse_orbit.y += mouse_dt.y;
        }
        if (wheel < 0) {
            orbit_distance += dt*5;
        } else if (wheel > 0) {
            orbit_distance -= dt*5;
        }

        orbit = m4.identity();
        orbit = m4.rotateY(orbit, -mouse_orbit.x*1.5);
        orbit = m4.rotateX(orbit, -mouse_orbit.y*1.5);
        orbit = m4.translate(orbit, [0,0,orbit_distance]);
        eye = m4.getTranslation(orbit);

        world = m4.translation([.3,-.3,-.5]);

        return m4.multiply(m4.multiply(projection, m4.inverse(m4.lookAt(eye, target, up))), world);
    }

    return update;
}