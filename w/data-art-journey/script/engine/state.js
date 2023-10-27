
import { initState, exitState } from "../main.js";
import { time } from "./time.js";
import { uniforms } from "./uniforms.js";
import { clamp01, easeInOutSine, mix } from "./utils.js";

function State ()
{
    let currentState = -1;
    let nextState = -1;
    let transition = 0;
    let delay = 1;
    let forward = true;

    this.METABALLS = 0;
    this.COLOR_PICKER = 1;
    this.TIME_DATE = 2;
    this.NAME = 3;
    this.PARTICLES = 4;
    this.END = 5;
    this.GIF = 6;

    this.set = function(newState)
    {
        if (currentState == -1)
        {
            transition = 1;
        }
        if (nextState != newState)
        {
            nextState = newState;
            exitState(currentState);
        }
    }

    this.get = () => { return currentState; }

    this.next = function()
    {
        this.set(currentState + 1);
        transition = 0;
        forward = true;
    }

    this.previous = function()
    {
        if (currentState == this.END) this.set(currentState - 2);
        else this.set(currentState - 1);
        transition = 0;
        forward = false;
    }

    this.isInTransition = function()
    {
        return transition < 1 || currentState != nextState;
    }

    this.update = function()
    {
        transition = clamp01(transition + time.getDeltaTime() / delay);

        if (currentState != nextState)
        {
            if (transition < 1)
            {
                if (forward)
                {
                    uniforms.fadeOut = easeInOutSine(transition, 0, 1, 1);
                }
                else
                {
                    uniforms.fadeIn = 1.-easeInOutSine(transition, 0, 1, 1);
                }
            }
            else
            {
                currentState = nextState;
                initState(currentState);
                transition = 0;
                uniforms.fadeIn = 0;
                uniforms.fadeOut = forward ? 0 : 1;
            }
        }
        else
        {
            uniforms.fadeIn = easeInOutSine(transition, 0, 1, 1);
            if (!forward)
            {
                uniforms.fadeOut = 1.-easeInOutSine(transition, 0, 1, 1);
            }
        }
    }
}

export let state = new State();