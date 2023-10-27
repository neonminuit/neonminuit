
window.onload = function () {
    const fullscreen = document.createElement("canvas");
    fullscreen.className = 'fullscreen';
    document.body.appendChild(fullscreen);

    // const grids = document.getElementsByClassName("grid");
    // for (var g = 0; g < grids.length; ++g) {
    //     const scripts = grids[g].getElementsByTagName("script");
    //     for (var s = 0; s < scripts.length; ++s) {
    //         console.log(scripts[s].src)
    //     }
    // }
    // console.log(shader20220124)
    
    const canvases = document.getElementsByTagName("canvas");
    const container = document.getElementsByClassName("container")[0];

    var preview = true;
    var transition = false;

    for (var c = 0; c < canvases.length; ++c) {
        
        const canvas = canvases[c];
        canvas.update = true;
        canvas.elapsed = 0;
        canvas.tick = 0;
        if (canvas.parentNode.className == 'grid') {
            webgl(canvas, glslCommon+escapeHtml(canvas.innerHTML)+softracer);
            canvas.addEventListener("mouseenter", event => canvas.update = true);
            canvas.addEventListener("mouseleave", event => canvas.update = false);
        }
        canvas.addEventListener("mousedown", event => {
            if (!transition) {
                transition = true;
                if (preview) {
                    container.style.opacity = '0';
                    fullscreen.style.opacity = '1';
                    // fullscreen.style.display = 'inline-block';
                    fullscreen.style.visibility = 'visible';
                    fullscreen.free = false;
                    fullscreen.update = true;
                    fullscreen.tick = 0;
                    fullscreen.elapsed = canvas.elapsed;
                    fullscreen.preview = canvas;
                    webgl(fullscreen, glslCommon+escapeHtml(canvas.innerHTML)+softracer);
                } else {
                    container.style.opacity = '1';
                    fullscreen.style.opacity = '0';
                    fullscreen.preview.tick = 0;
                    fullscreen.preview.elapsed = fullscreen.elapsed;
                }
                setTimeout(function() {
                    if (preview) {
                        for (var cc = 0; cc < canvases.length; ++cc) {
                            if (canvases[cc].parentNode.className == 'grid') {
                                canvases[cc].update = false;
                            }
                        }
                    } else {
                        fullscreen.free = true;
                        // fullscreen.style.display = 'none';
                        fullscreen.style.visibility = 'hidden';
                    }
                    preview = !preview;
                    transition = false;
                }, 500);
            }
        });
    }


    function escapeHtml(html)
    {
        return html.replace("&lt;", "<");
    }

    // https://www.javascripttutorial.net/dom/css/check-if-an-element-is-visible-in-the-viewport/
    function checkVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}