
const canvas = document.getElementById("shader");
const gl = canvas.getContext("webgl");
const prim = twgl.primitives;
const m4 = twgl.m4;
const uniforms = 
{
    time: 0,
    resolution: [0, 0],
    mouse: [0, 0],
    cursor: [0.5, 0.5],
    matrix: 0,
    transition: 0,
    fade: 1,
    image: 0,
    scale: [1,1],
    offset: [0,0],
    blend: 1,
    blueNoise: twgl.createTexture(gl, { src: 'asset/shadertoy-bluenoise.png' }),
    frostMap: twgl.createTexture(gl, { src: 'asset/TexturesCom_Ice0002_1_S.jpg' }),
}
let width, height;
let projection;

// main loop
function render(time)
{

    // resize canvas and frames
    if (twgl.resizeCanvasToDisplaySize(gl.canvas))
    {
        width = gl.canvas.width;
        height = gl.canvas.height;
        projection = m4.perspective(30 * Math.PI / 180, width / height, 0.5, 10);
    }
    
    uniforms.time = time / 1000.;
    uniforms.resolution = [width, height];
    uniforms.mouse = [mouse[0]/width, 1.-mouse[1]/height]

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    switch (state)
    {
        case METABALLS:
            metaballs.draw(gl);
            break;

        case COLOR_PICKER:
            gradient.draw(gl);
            cursor.draw(gl);
            break;

        case TIME_DATE:
            timeDate.draw(gl);
            break;
    }
}

gradient.init(gl);
metaballs.init(gl);
cursor.init(gl);
timeDate.init(gl);