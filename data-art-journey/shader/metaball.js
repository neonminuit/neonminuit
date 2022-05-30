
const metaball = glsl`

    uniform float time, transition, fade;
    uniform vec2 resolution, cursor;
    varying vec2 uv;

    void main() {
        vec2 pos = (gl_FragCoord.xy - resolution.xy / 2.) / resolution.y;
        vec2 pp = pos;
        vec2 p;
        vec2 mous = (cursor*2.-1.)*0.5*vec2(resolution.x/resolution.y,1);
        float mouseRadius = 0.5;
        // pos += normalize(mous - pos) * ss(mouseRadius,0.,length(mous-pos)) * 0.1;


        // parameters
        float interval = 2.;
        float size = 0.1*(fade > 0.5 ? transition : 1.-transition);
        float radius = size;
        const float count = 8.;

        // shapes
        float dist = 100.;
        float d = 100.;
        float shape = 100.;
        float blend = 1.;
        float r = 1.;
        for (float index = 0.; index < count; ++index)
        {
            float i = index / count;
            float t = time / interval + i * 1957.;
            float r = floor(t);
            vec2 offset = mix(hash21(index+r), hash21(index+r+1.), fract(t));
            float a = t;
            offset += vec2(cos(a),sin(a)) * sin(t*5.) * 0.2;
            radius = size*(hash11(index)*0.5+0.5);
            offset = (offset*2.-1.) * .3;
            p = pos + offset;
            dist = length(p) - radius;
            float select = smoo(shape, dist, radius*blend);
            pp = mix(p, pp, select);
            shape = smin(shape, dist, radius*blend);
        }

        // mouse
        p = pos - mous;
        dist = length(p) - size;
        float select = smoo(shape, dist, radius*blend);
        pp = mix(p, pp, select);
        shape = smin(shape, dist, radius*blend);
        
        // background
        float x = gl_FragCoord.x / resolution.x;
        vec3 background = vec3(ss(1.5, -.5, length(pos)));
        if (fade < 0.5)
        {
            background = mix(background, 0.5 + 0.5 * cos(vec3(0,.3,.6)*6.28+x*6.28+1.5), transition);
        }
        background *= clamp(shape*5.+.9, 0., 1.);
        vec3 color = background;
        
        if (radius > .001)
        {
            // normal from position
            pp /= radius;
            dist = length(pp);
            float z = 1.-clamp(dist*dist, 0., 1.);
            vec3 normal = vec3(pp, z);
            
            // coloring
            float light = dot(normal, normalize(vec3(1,1,1)));
            float colorOffset = time + light * 2.;
            // color *= clamp(-shape/radius+.8, 0., 1.);
            color = 0.5 + 0.5 * cos(vec3(0,.3,.6)*6.+colorOffset);
            color = mix(background, color, step(shape, 0.));
        }
        
        gl_FragColor = vec4(color, 1);
    }

`+""

const metaballs = 
{
    mesh: 0,
    material: 0,
    init: function(gl)
    {
        this.mesh = twgl.createBufferInfoFromArrays(gl,
            prim.createPlaneVertices()
        )
        this.material = twgl.createProgramInfo(gl, [
            common+shader.vertex,
            common+metaball
        ]);
    },
    draw: function(gl)
    {
        gl.viewport(0, 0, width, height);
        gl.useProgram(this.material.program);
        twgl.setBuffersAndAttributes(gl, this.material, this.mesh);
        twgl.setUniforms(this.material, uniforms);
        twgl.drawBufferInfo(gl, this.mesh);
    },
}