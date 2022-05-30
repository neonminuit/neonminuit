
let shader = {

    vertex: glsl`
        attribute vec2 texcoord;
        varying vec2 uv;

        void main() {
            uv = texcoord;
            gl_Position = vec4(texcoord * 2. - 1., 0, 1);
        }

    `+"",

    pixel: glsl`
        varying vec2 uv;

        void main() {
            gl_FragColor = vec4(uv, 0, 1);
        }

    `+"",

    mesh: glsl`
        attribute vec4 position;
        uniform mat4 matrix;

        void main()
        {
            gl_Position = matrix * position;
        }
    `+"",

    color: glsl`

        void main()
        {
            gl_FragColor = vec4(1,0,0,1);
        }
    `+"",
}