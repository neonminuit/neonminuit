
export function clamp01(t) { return Math.max(0, Math.min(1, t)); }

export function mix (a, b, t) { return a + (b - a) * t };

export function mixArray (a, b, t)
{ 
    let array = [];
    for (let i = 0; i < a.length; i++)
        array[i] = mix(a[i], b[i], t);
    return array;
}

// https://www.geeksforgeeks.org/fabric-js-easeinoutsine-method/
export function easeInOutSine(t, b, c, d)
{
    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
}


export function HSVtoRGB (h, s, v)
{
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    
    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);

    function componentToHex(c) {
        let hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
}