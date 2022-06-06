
import { uniforms } from './uniforms.js'

function Time ()
{
    let elapsed = 0;
    let deltaTime = 0;

    this.getTime = () => { return elapsed; }
    this.getDeltaTime = () => { return deltaTime; }

    this.update = function(timeElapsed)
    {
        deltaTime = timeElapsed / 1000 - elapsed;
        elapsed = timeElapsed / 1000;
        uniforms.time = elapsed;
    }
}

export const time = new Time();