

shader.cursorVertex = glsl`

    attribute vec4 position;
    attribute vec2 texcoord;
    uniform mat4 matrix;
    uniform vec2 cursor;
    uniform float transition, fade;
    varying vec4 color;

    void main()
    {
        vec4 pos = position;
        if (fade < 0.5) pos.xyz *= (1.-transition);
        gl_Position = matrix * pos;
        gl_Position.xy += (cursor * 2. - 1.)*5.;
        color = vec4(step(0.5, texcoord.x));
    }
`+"";

shader.cursorPixel = glsl`

    varying vec4 color;

    void main()
    {
        gl_FragColor = vec4(color.rgb, 1);
    }
`+"";

shader.cursorShadowVertex = glsl`

    attribute vec4 position;
    attribute vec2 texcoord;
    uniform mat4 matrix;
    uniform vec2 cursor;
    uniform float transition, fade;

    void main()
    {
        vec4 pos = position;
        if (fade < 0.5) pos.xyz *= (1.-transition);
        gl_Position = matrix * pos;
        gl_Position.xy += (cursor * 2. - 1.)*5. - .5;
    }
`+"";

shader.cursorShadowPixel = glsl`

    void main()
    {
        gl_FragColor = vec4(0,0,0,0.9);
    }
`+"";

const cursor =
{
    ready: false,
    mesh: 0,
    material: 0,
    materialShadow: 0,
    x: 0,
    y: 0,
    init: function(gl)
    {
        this.material = twgl.createProgramInfo(gl, [
            common+shader.cursorVertex,
            common+shader.cursorPixel
        ])
        this.materialShadow = twgl.createProgramInfo(gl, [
            common+shader.cursorShadowVertex,
            common+shader.cursorShadowPixel
        ])
        const self = this;
        loadFile('asset/cursor.obj', function(error, data) {
            let positions = [];
            let uvs = [];
            let indices = [];
            const lines = data.split('\n');
            for (let l = 0; l < lines.length; l++) {
                const element = lines[l];
                const columns = element.split(' ');
                if (columns[0] == 'v')
                {
                    positions.push(
                        parseFloat(columns[1]),
                        parseFloat(columns[2]),
                        parseFloat(columns[3])
                    );
                }
                else if (columns[0] == 'vt')
                {
                    uvs.push(
                        parseFloat(columns[1]),
                        parseFloat(columns[2])
                    );
                }
                else if (columns[0] == 'f')
                {
                    const a = columns[1].split('/')[0];
                    const b = columns[2].split('/')[0];
                    const c = columns[3].split('/')[0];
                    indices.push(
                        parseFloat(a-1),
                        parseFloat(b-1),
                        parseFloat(c-1)
                    );
                }
            }
            self.mesh = twgl.createBufferInfoFromArrays(gl, {
                position: { numComponents: 3, data: positions },
                texcoord: { numComponents: 2, data: uvs },
                indices: { numComponents: 3, data: indices },
            });
            self.ready = true;
        })
    },
    draw: function(gl)
    {
        if (this.ready)
        {

            const eye = [0, 0, 5];
            const target = [0, 0, 0];
            const up = [0, 1, 0];

            const camera = m4.lookAt(eye, target, up);
            const view = m4.inverse(camera);
            const viewProjection = m4.multiply(projection, view);
            const world = m4.identity();
            const vel = mouseVelocity;
            const velMax = 100;
            let rotY = 0.2*Math.sign(vel[0]) * Math.min(velMax, Math.abs(vel[0]));
            let rotX = 0.2*Math.sign(vel[1]) * Math.min(velMax, Math.abs(vel[1]));
            let offset = -1.;
            // m4.translate(world, [0,offset,0], world);
            rotX -= Math.sin(elapsed) * .4;
            rotY += Math.cos(elapsed) * .2;
            rotY += 0.5;
            m4.rotateX(world, rotX, world);
            m4.rotateY(world, rotY, world);
            // m4.translate(world, [0,-offset,0], world);
            // const world = m4.translation([this.x, this.y, 0]);
            uniforms.matrix = m4.multiply(viewProjection, world);
      
            gl.viewport(0, 0, width, height);
            // gl.disable(gl.DEPTH_TEST);
            // gl.enable(gl.CULL_FACE);
            // gl.enable(gl.BLEND);
            // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            // gl.useProgram(this.materialShadow.program);
            // twgl.setBuffersAndAttributes(gl, this.materialShadow, this.mesh);
            // twgl.setUniforms(this.materialShadow, uniforms);
            // twgl.drawBufferInfo(gl, this.mesh);
            
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.disable(gl.BLEND);
            gl.useProgram(this.material.program);
            twgl.setBuffersAndAttributes(gl, this.material, this.mesh);
            twgl.setUniforms(this.material, uniforms);
            twgl.drawBufferInfo(gl, this.mesh);
        }
    },

    HSVtoRGB: function (h, s, v) {
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
    },
}