
export const events = {

    mouse: [0, 0],
    mouse_prev: [0, 0],
    mouse_dt: [0, 0],
    mouseViewport: [0, 0],
    wheel: 0,
    clic: false,
    clicLeft: false,
    leftPressed: false,

    hook: function(element)
    {
        element.onmousemove = event => {
            const x = event.clientX;
            const y = event.clientY;
            const w = element.width;
            const h = element.height;
            const aspect = w/h;
            events.mouse = [((x/w)*2-1)*aspect, (y/h)*2-1];
            events.mouseViewport = [x, y];
        };

        element.ontouchmove = event => {
            const x = event.changedTouches[0].clientX;
            const y = event.changedTouches[0].clientY;
            const w = element.width;
            const h = element.height;
            events.mouse = [((x/w)*2-1)*aspect, (y/h)*2-1];
            events.mouseViewport = [x, y];
        };

        element.onmousedown = event => {
            events.clic = true;
            events.leftPressed = true;
            events.clicLeft = event.button == 0;
        };

        element.oncontextmenu = event => {
            event.preventDefault();
            event.stopPropagation();
        };

        element.onmouseup = event => {
            events.clic = false;
        };

        element.onmouseleave = event => {
            events.clic = false;
        };

        element.ontouchend = event => {
            events.clic = false;
        };

        element.ontouchstart = event => {
            events.clic = true;
        };

        element.onwheel = event => {
            events.wheel = event.wheelDelta;
        };
    },

    update: function() {

        // mouse delta
        events.mouse_dt[0] = events.mouse[0] - events.mouse_prev[0];
        events.mouse_dt[1] = events.mouse[1] - events.mouse_prev[1];
        events.mouse_prev[0] = events.mouse[0];
        events.mouse_prev[1] = events.mouse[1];
        
    },

    endOfFrame: function() {
        events.wheel = 0;
        events.leftPressed = false;
    }
}