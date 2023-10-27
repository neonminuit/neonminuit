
export let persistent = {
    mouse_orbit: [0,0],
    orbit_distance: 1.5,
}

Object.keys(persistent).forEach((key) => {
    const item = localStorage.getItem(key)
    if (item !== undefined && item !== null) {
        if (item == 'true') {
            value = true;
        } else if (item == 'false') {
            value = false;
        } else {
            var value = item.split(',').map(n => +n)
            if (value.length == 1) {
                const number = parseFloat(item);
                if (number !== NaN) {
                    value = number;
                }
            }
        }
        persistent[key] = value
    }
})
