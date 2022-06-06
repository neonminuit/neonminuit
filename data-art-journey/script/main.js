
import { dom } from './engine/dom.js'
import { input } from './engine/input.js'
import { webgl } from './engine/webgl.js'
import { time } from "./engine/time.js";
import { uniforms } from "./engine/uniforms.js";
import { clamp01, easeInOutSine, HSVtoRGB } from './engine/utils.js'

import { state } from './engine/state.js';
import { user } from './engine/user.js';
import { metaball } from "./module/metaball.js";
import { colorPicker } from "./module/colorPicker.js";
import { cursor } from "./module/cursor.js";
import { timeDate } from "./module/timeDate.js";
import { particles } from "./module/particles.js";
import { name } from './module/name.js';

let width = window.innerWidth;
let height = window.innerHeight;

window.onload = function()
{
    input.hook(dom.events);
    state.set(state.METABALLS);

    dom.buttonOK.addEventListener('mousedown', function(){
        if (!state.isInTransition() && dom.buttonOK.style.opacity != 0) state.next();
    });
    dom.buttonBack.addEventListener('mousedown', function(){
        if (!state.isInTransition() && dom.buttonBack.style.opacity != 0) state.previous();
    });
    dom.buttonData.addEventListener('mousedown', function(){
        if (!state.isInTransition()) state.next();
        // data upload
        // user.getColor();
        // user.getTimeDate();
        // user.getName();
    });

    let rendering = false;
    const frameRate = 16;
    const duration = 2;
    var gif = new GIF({
        workers: 2,
        quality: 10
    });
    gif.on('finished', function(blob) {
        window.open(URL.createObjectURL(blob));
    });
    dom.buttonGif.addEventListener('mousedown', function(){
        dom.hide(dom.buttonGif);
        if (!rendering) {
            rendering = true;
            let capture = () => {
                gif.addFrame(dom.canvas, {delay: 1000/frameRate});
            };
            setInterval(capture, 1000/frameRate);
            setTimeout(() => {
                clearInterval(capture);
                gif.render();
            }, duration * 1000);
        }
    });

    dom.buttonGif.style.display = 'none';
    setTimeout(() => {
        dom.fade.style.opacity = 0;
        setTimeout(() => {
            dom.fade.style.visibility = 'hidden';
        }, 1000);
    }, 1000);
    
    requestAnimationFrame(update);
}

function update(timeElapsed)
{
    requestAnimationFrame(update);
    
    width = window.innerWidth;
    height = window.innerHeight;

    time.update(timeElapsed);
    state.update();
    
    let mouseSmooth;

    // const infoText = 'DATA ART JOURNEY<br/><b>LA COULEUR</b><br/><br/>';
    dom.data.innerHTML = user.getHTML();

    switch (state.get())
    {
        case state.METABALLS:
            webgl.clear();
            webgl.draw(metaball);
            input.update();
            break;

        case state.COLOR_PICKER:

            webgl.clear();
            webgl.draw(colorPicker);
            webgl.draw(cursor);
            input.updateDrag();
            mouseSmooth = input.getMouseSmooth();
            uniforms.cursor = [mouseSmooth[0]/width, 1.-mouseSmooth[1]/height];
            
            // color hex
            const colorHex = HSVtoRGB((1-uniforms.cursor[0] - .2 + 1) % 1, 1, 1);
            dom.colorPicker.style.top = (mouseSmooth[1] - 100) + "px";
            dom.colorPicker.style.left = (mouseSmooth[0] + 20) + "px";
            dom.colorPicker.style.color = 'white';
            dom.colorPicker.style.textShadow = '-10px 10px 20px black';
            dom.colorPicker.textContent = colorHex;
            user.setColor(colorHex);
            user.setColorCursor(mouseSmooth);
            break;
            
        case state.TIME_DATE:

            webgl.clear();
            webgl.draw(timeDate);
            input.update();
            timeDate.update();
            mouseSmooth = input.getMouseSmooth();
            uniforms.cursor = [mouseSmooth[0]/width, 1.-mouseSmooth[1]/height];

            // freeze time
            if (input.getPressed()) {
                timeDate.toggle();
                if (timeDate.getPause()) dom.show(dom.buttonOK);
                else dom.hide(dom.buttonOK);
            }

            user.setTimeDate(timeDate.getTime());
            break;

        case state.NAME:

            webgl.clear();
            webgl.draw(name);
            input.update();
            user.setName(name.getBinary());

            // validate button
            if (!state.isInTransition()) {
                if (dom.inputText.value != '' && !dom.isVisible(dom.buttonOK))
                    dom.show(dom.buttonOK);
                else if (dom.inputText.value == '' && dom.isVisible(dom.buttonOK))
                    dom.hide(dom.buttonOK)
            }
            break;

        case state.PARTICLES:
            webgl.draw(particles);
            input.update();
            break;

        case state.GIF:
            webgl.clear();
            // webgl.crop(0,height/4,width,height/2);
            webgl.draw(name);
            input.update();
            break;
    }
    
    webgl.update(state.get());
}

export function initState(newState)
{
    dom.hide(dom.inputText);
    dom.hide(dom.buttonBack);
    dom.hide(dom.buttonOK);
    dom.hide(dom.colorPicker);
    dom.hide(dom.content);
    dom.hide(dom.info);
    dom.hide(dom.data);
    dom.hide(dom.containerEnd);
    dom.hide(dom.buttonGif);

    switch (newState)
    {
        case state.METABALLS:

            dom.show(dom.buttonOK);
            dom.show(dom.content);
            dom.show(dom.info);
            input.setMouse([width/2, height/2]);
            break;

        case state.COLOR_PICKER:

            dom.show(dom.buttonBack);
            dom.show(dom.buttonOK);
            dom.show(dom.colorPicker);
            dom.show(dom.info);
            dom.show(dom.data);
            input.setMouseSmooth(user.getColorCursor());
            input.setMouseTarget(user.getColorCursor());
            break;

        case state.TIME_DATE:
            
            dom.show(dom.buttonBack);
            dom.show(dom.info);
            dom.show(dom.data);
            if (timeDate.getPause()) dom.show(dom.buttonOK);
            input.setMouse([width/2, height/2]);
            input.setMouseSmooth([width/2, height/2]);
            input.setMouseTarget([width/2, height/2]);
            break;

        case state.NAME:
            
            dom.show(dom.buttonBack);
            dom.show(dom.inputText);
            dom.show(dom.info);
            dom.show(dom.data);
            break;

        case state.PARTICLES:
            particles.reset();
            break;

        case state.END:
            dom.data.style.display = 'none';
            dom.events.style.display = 'none';
            dom.containerEnd.style.opacity = 1;
            dom.show(dom.buttonBack);
            break;


        case state.GIF:
            uniforms.blackOut = 0;
            name.setAnimation(1);
            dom.canvas.style.width = '50vw';
            dom.canvas.style.height = '50vh';
            dom.canvas.style.left = '25vw';
            dom.canvas.style.top = '25vh';
            dom.data.style.display = 'none';
            dom.events.style.display = 'none';
            dom.buttonData.style.display = 'none';
            dom.buttonGif.style.display = 'inline-block';
            dom.show(dom.buttonGif);
            break;
    
        default:
            break;
    }
}

export function exitState(currentState)
{
    dom.hide(dom.inputText);
    dom.hide(dom.buttonBack);
    dom.hide(dom.buttonOK);
    dom.hide(dom.colorPicker);
    dom.hide(dom.content);
    dom.hide(dom.info);
    dom.hide(dom.data);
    dom.hide(dom.containerEnd);
    dom.hide(dom.buttonGif);

    switch (currentState)
    {
        case state.END:
            dom.data.style.display = 'inline-block';
            dom.events.style.display = 'inline-block';
            break;

        case state.GIF:
            dom.canvas.style.width = '100vw';
            dom.canvas.style.height = '100vh';
            dom.canvas.style.left = '0';
            dom.canvas.style.top = '0';
            dom.data.style.display = 'inline-block';
            dom.events.style.display = 'inline-block';
            break;
    
        default:
            break;
    }
}