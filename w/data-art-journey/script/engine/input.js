
import { mixArray } from "./utils.js";
import { time } from "./time.js";

function Input ()
{
    let clic = false;
    let pressed = false;
    let mouse = [0, 0];
    let mouseTarget = [0, 0];
    let mouseSmooth = [0, 0];
    let mouseLast = [0, 0];
    let mouseVelocityRaw = [0, 0];
    let mouseVelocity = [0, 0];
    let smooth = 3;
    let framePressed = 0;

    this.getClic = () => { return clic; }
    this.getPressed = () => { return pressed; }
    this.getMouse = () => { return mouse; }
    this.getMouseSmooth = () => { return mouseSmooth; }
    this.getMouseVelocity = () => { return mouseVelocity; }
    
    this.setMouse = (v) => { mouse = v; }
    this.setMouseSmooth = (v) => { mouseSmooth = v; }
    this.setMouseTarget = (v) => { mouseTarget = v; }

    this.update = function()
    {
        const blend = smooth * time.getDeltaTime();
        mouseSmooth = mixArray(mouseSmooth, mouse, blend);
        this.updateCommon();
    }

    this.updateDrag = function()
    {
        if (clic) mouseTarget = mouse;

        const dt = time.getDeltaTime();
        const blend = smooth * dt;
        mouseSmooth = mixArray(mouseSmooth, mouseTarget, blend);
        this.updateCommon();

        // else mouseVelocityRaw = mixArray(mouseVelocityRaw, [0,0], blend);
    }

    this.updateCommon = function()
    {
        const dt = time.getDeltaTime();
        const blend = smooth * dt;
        mouseVelocity = mixArray(mouseVelocity, mouseVelocityRaw, blend);
        mouseVelocityRaw = [mouseSmooth[0]-mouseLast[0], mouseSmooth[1]-mouseLast[1]];
        // console.log(Math.floor(mouseVelocity[0]*100));
        mouseLast = [mouseSmooth[0], mouseSmooth[1]];
        if (pressed)
        {
            if (framePressed == 0) framePressed += 1;
            else pressed = false;
        }
    }

    this.mousemove = function(e)
    {
        mouse = [e.clientX, e.clientY];
    }

    this.mouseup = function(e)
    {
        clic = false;
    }

    this.mousedown = function(e)
    {
        mouse = [e.clientX, e.clientY];
        mouseLast = [e.clientX, e.clientY];
        mouseVelocity = [0,0];
        mouseVelocityRaw = [0,0];
        clic = true;
        pressed = true;
        framePressed = 0;
    }

    this.hook = function(dom)
    {
        dom.addEventListener("mousemove", this.mousemove);
        dom.addEventListener("mousedown", this.mousedown);
        dom.addEventListener("mouseup", this.mouseup);
    }

}

export let input = new Input();