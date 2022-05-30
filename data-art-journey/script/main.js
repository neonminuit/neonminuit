

// DOMs elements
const container = document.getElementById("container");
const content = document.getElementById("content");
const colorPicker = document.getElementById("color-picker");
const buttonOK = document.getElementById("button-ok");

// timing
let elapsed = 0;
let deltaTime = 0;
let transition = 0;

// input events
let clic = false;
let mouse = [0, 0];
let mouseLast = [0, 0];
let mouseVelocityRaw = [0, 0];
let mouseVelocity = [0, 0];
let mouseTarget = [0, 0];
let mouseSmooth = [0, 0];
const smooth = 2;
container.addEventListener("mousemove", function(e)
{
    mouse = [e.clientX, e.clientY];
});
container.addEventListener("mousedown", function(e)
{
    mouse = [e.clientX, e.clientY];
    mouseLast = [e.clientX, e.clientY];
    mouseVelocity = [0,0];
    mouseVelocityRaw = [0,0];
    clic = true;
});
container.addEventListener("mouseup", function(e)
{
    clic = false;
});


// states
const METABALLS = 0;
const COLOR_PICKER = 1;
const TIME_DATE = 2;
const NAME = 3;
let state = METABALLS;

setMetaballs();
// setColorPicker();
// setTimeDate();

function update(time)
{
    deltaTime = time / 1000 - elapsed;
    requestAnimationFrame(update);

    transition = clamp01(transition + deltaTime);
    uniforms.transition = easeInOutSine(transition, 0, 1, 1);

    
    switch (state)
    {
        case METABALLS:
            updateMetaballs();
            break;
        case COLOR_PICKER:
            updateColorPicker();
            break;
        case TIME_DATE:
            updateTimeDate();
            break;
        case NAME:
            updateTimeDate();
            break;
    }

    render(time);
    elapsed = time / 1000;
}

requestAnimationFrame(update);

// part 1 with metaballs and text introductions
function setMetaballs()
{
    state = METABALLS;

    transition = 0;
    uniforms.fade = 1;
    
    const part1Texts = [

    // `Welcome to<br/>
    // DATA ART JOURNEY`,

    // `A digital art project
    // that need your data`,

    // `Follow the steps and be part of
    // the film to present in October
    // 2023`,
    ];

    colorPicker.style.visibility = 'hidden';
    buttonOK.style.visibility = 'visible';
    buttonOK.style.opacity = '100%';

    let current = 0;
    let isTransition = false;
    // content.innerHTML = part1Texts[current];
    function part1Clic()
    {
        // if (!isTransition)
        // {
            // isTransition = true;
            content.style.opacity = '0%';
            buttonOK.style.opacity = '0%';
            // if (current+1 >= part1Texts.length)
            // {
                transition = 0;
                uniforms.fade = 0;
            // }
            buttonOK.removeEventListener("mousedown", part1Clic);
            setTimeout(() => {
                setColorPicker();
                // if (current+1 < part1Texts.length)
                // {
                //     current = current + 1;
                //     content.classList.remove('fadeOut');
                //     content.innerHTML = part1Texts[current];
                //     isTransition = false;
                // }
                // else
                // {
                // }
            }, 1000);
        // }
    }
    buttonOK.addEventListener("mousedown", part1Clic);
}

function setColorPicker()
{
    state = COLOR_PICKER;

    mouseSmooth = [window.innerWidth/2, window.innerHeight*2];
    mouseTarget = [window.innerWidth/2, window.innerHeight/2];
    const colorHex = cursor.HSVtoRGB((1-uniforms.cursor[0] - .2 + 1) % 1, 1, 1);
    colorPicker.style.color = colorHex;
    colorPicker.textContent = colorHex;

    transition = 0;
    uniforms.fade = 1;

    content.style.visibility = 'hidden';
    colorPicker.style.visibility = 'visible';
    buttonOK.style.visibility = 'visible';
    buttonOK.style.opacity = '100%';

    var next = function() {
        transition = 0;
        uniforms.fade = 0;
        buttonOK.style.opacity = '0%';
        colorPicker.style.opacity = '0%';
        setTimeout(() => {
            setTimeDate();
        }, 1000);
        buttonOK.removeEventListener('mousedown', next);
    }

    buttonOK.addEventListener('mousedown', next);
}

function setTimeDate()
{
    state = TIME_DATE;
    
    transition = 0;
    uniforms.fade = 1;
    
    mouse = [window.innerWidth/2, window.innerHeight/2];
    mouseSmooth = [window.innerWidth/2, window.innerHeight/2];
    mouseTarget = [window.innerWidth/2, window.innerHeight/2];
    uniforms.cursor = [mouseSmooth[0]/width, 1.-mouseSmooth[1]/height];
    
    content.style.visibility = 'hidden';
    colorPicker.style.visibility = 'hidden';
    buttonOK.style.visibility = 'visible';
    buttonOK.style.opacity = '0%';
    
    var next = function() {
        if (timeDate.pause)
        {
            transition = 0;
            uniforms.fade = 0;
            buttonOK.style.opacity = '0%';
            colorPicker.style.opacity = '0%';
            setTimeout(() => {
                setName();
            }, 1000);
            buttonOK.removeEventListener('mousedown', next);
            container.removeEventListener('mousedown', interact);
        }
    }

    var interact = function()
    {
        timeDate.pause = !timeDate.pause;
        buttonOK.style.opacity = timeDate.pause ? '100%' : '0%';
    }

    container.addEventListener('mousedown', interact);
    buttonOK.addEventListener('mousedown', next);
}

function setName()
{
    state = NAME;

    transition = 0;
    uniforms.fade = 1;
    
    content.style.visibility = 'hidden';
    colorPicker.style.visibility = 'hidden';
    buttonOK.style.visibility = 'visible';
    buttonOK.style.opacity = '100%';
}

function updateTimeDate()
{
    const blend = 3 * deltaTime;
    mouseTarget = mouse;
    mouseSmooth = mixArray(mouseSmooth, mouseTarget, blend);
    mouseVelocity = mixArray(mouseVelocity, mouseVelocityRaw, blend);
    mouseVelocityRaw = [mouseSmooth[0]-mouseLast[0], mouseSmooth[1]-mouseLast[1]];
    mouseLast = [mouseSmooth[0], mouseSmooth[1]];

    uniforms.cursor = [mouseSmooth[0]/width, 1.-mouseSmooth[1]/height];
}

function updateMetaballs()
{
    const blend = 5 * deltaTime;
    mouseTarget = mouse;
    mouseSmooth = mixArray(mouseSmooth, mouseTarget, blend);
    mouseVelocity = mixArray(mouseVelocity, mouseVelocityRaw, blend);
    mouseVelocityRaw = [mouseSmooth[0]-mouseLast[0], mouseSmooth[1]-mouseLast[1]];
    mouseLast = [mouseSmooth[0], mouseSmooth[1]];

    uniforms.cursor = [mouseSmooth[0]/width, 1.-mouseSmooth[1]/height];
}

function updateName()
{
    const blend = 5 * deltaTime;
    mouseTarget = mouse;
    mouseSmooth = mixArray(mouseSmooth, mouseTarget, blend);
    mouseVelocity = mixArray(mouseVelocity, mouseVelocityRaw, blend);
    mouseVelocityRaw = [mouseSmooth[0]-mouseLast[0], mouseSmooth[1]-mouseLast[1]];
    mouseLast = [mouseSmooth[0], mouseSmooth[1]];

    uniforms.cursor = [mouseSmooth[0]/width, 1.-mouseSmooth[1]/height];
}

function updateColorPicker()
{
    const blend = 5 * deltaTime;
    mouseSmooth = mixArray(mouseSmooth, mouseTarget, blend);
    mouseVelocity = mixArray(mouseVelocity, mouseVelocityRaw, deltaTime);
    mouseVelocityRaw = [mouseSmooth[0]-mouseLast[0], mouseSmooth[1]-mouseLast[1]];
    mouseLast = [mouseSmooth[0], mouseSmooth[1]];

    uniforms.cursor = [mouseSmooth[0]/width, 1.-mouseSmooth[1]/height];
    
    colorPicker.style.top = (mouseSmooth[1] - 100) + "px";
    colorPicker.style.left = (mouseSmooth[0] + 20) + "px";
    const colorHex = cursor.HSVtoRGB((1-uniforms.cursor[0] - .2 + 1) % 1, 1, 1);
    colorPicker.style.color = 'white';//colorHex;
    colorPicker.style.textShadow = '0px 0px 20px white';//+colorHex;
    colorPicker.textContent = colorHex;

    if (clic)
    {
        mouseTarget = mouse;
    }
    else
    {
        mouseVelocityRaw = mixArray(mouseVelocityRaw, [0,0], blend);
    }
}

function clamp01(t) { return Math.max(0, Math.min(1, t)); }
function mix (a, b, t) { return a + (b - a) * t };
function mixArray (a, b, t) { 
    let array = [];
    for (let i = 0; i < a.length; i++)
        array[i] = mix(a[i], b[i], t);
    return array;
}
// https://www.geeksforgeeks.org/fabric-js-easeinoutsine-method/
function easeInOutSine(t, b, c, d) {
    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
}