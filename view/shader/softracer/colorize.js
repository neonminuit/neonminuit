
const glsl = x => x;

export const colorize = glsl`

void main()
{
   
    // vec3 bnoise = texture2D(blueNoiseMap, gl_FragCoord.xy/1024.+1337.0*fract(time)).rgb;
    vec2 uv = gl_FragCoord.xy/resolution;
    vec2 vv = 2. * (gl_FragCoord.xy - resolution.xy / 2.) / resolution.y;
   
    vec4 pos = texture2D(frameDepth, uv);
    vec3 normal = texture2D(frameNormal, uv).xyz;
    vec3 ray = normalize(mat3(viewInverse) * (projectionInverse * vec4(uv * 2. - 1., 0, 1.)).xyz);
    
    
    float depth = pos.a;
    float material = pos.x;
    
    pos.xyz = viewInverse[3].xyz + normalize(vec3(vv,fov)) * depth;
    
    vec3 rf = reflect(ray, normal);
    float lp = length(pos.xyz);
    
    // color
    vec3 color = vec3(0);
    // vec3 tint = palette(floor(material*6.)*.5+2.);
    // float colorOffset = floor(material * 10.);//floor(3. * material);
    float dt = pow(clamp(dot(rf, vec3(0,1,0))*.5+.5, 0., 1.), 4.);
    float colorOffset = (material)*12. - dt * 3.;//+pos.x*20.;
    // float lod = .5;
    // colorOffset = floor(colorOffset*lod)/lod;
    colorOffset = pos.y*20. + material*20.;
    // vec3 tint = vec3(.5,0,0)+vec3(.9,.1,0)*cos(vec3(1,2,3)+colorOffset-2.);
    // vec3 tint = .5+.5*cos(vec3(1,2,3)+colorOffset);
    vec3 tint = vec3(1);
    // tint = palette(material*10.) * pow(dot(rf, vec3(0,-1,0))*.5+.5, 1.);
    // float dt = pow(clamp(dot(rf, normalize(vec3(0,-1,-.1))), 0., 1.), 5.);
    // float dt = pow(clamp(dot(rf, normalize(-pos.xyz))*.5+.5, 0., 1.), 5.);
    tint = mix(tint, .5+.5*cos(vec3(1,2,3)+colorOffset), dt);
    // tint = mix(tint, .5+.5*cos(vec3(0.5,3,1.)+colorOffset), abs(material));
    // tint = mix(tint, vec3(0,1,0), abs(material));
    // tint = vec3(.6,.4,.1) + vec3(.3,.2,.3) * cos(vec3(2,.5,30)*colorOffset);
    // tint = mix(tint, vec3(0), 1.-dt);
    // tint += smoothstep(.01,.0,sin(material*100.)+.9);
    if (material < 0.) {
        // tint = vec3(0);
        // tint = mix(tint, vec3(0), dt);
    } else {
        // tint = vec3(.5)*smoothstep(.01, .0, sin(material*200.)+.5);
    }
    // tint = 1.-tint;
    // tint = mix(vec3(1), tint, fract(material));
    // tint = vec3(0)*(tint.r+tint.g+tint.b)/3.;
    // tint = vec3(1);
    // tint = 1.-tint;
    // tint.gb *= .2;
    // lighting
    vec3 glow = vec3(.2) * pow(dot(rf, ray)*.5+.5, 1.);
    vec3 light = vec3(.7) * pow(dot(rf, vec3(0,1,0))*.5+.5, 10.);
    // vec3 polarized = vec3(.8,.7,.6) * pow(dot(rf, vec3(0,-1,0))*.5+.5, 2.);
    
    // shadows
    float ao = texture2D(frameAO, uv).r;
    float sh = pow((dot(-ray, normal)*.5+.5), 1.0);
    
    // patterns
    // tint *= smoothstep(.001, .0, sin(length(pos)*20./material)-.5);
    // tint *= 1.-clamp(mod(floor(material), 4.), 0., 1.);
    
    // float lod = 30.;
    // tint *= floor(depth*lod)/lod;
    // tint *= .5+.5*sin(material*.5);
    
    // composition
    if (depth > 0.) {
        color = tint + (glow + light);
    } else {
        color = vec3(.1);
    }

    color *= ao;
    // color = 1.-color;

    // color = vec3(fract(material*10.));

    if (false) {
        // color = palette(floor(uv.x*3.)+2.);
        float cell = 1./4.;
        uv.x = (uv.x-.5)*2.+.5;
        // uv.x = fract(abs(uv.x)+time*.1);
        // color = vec3(fract(depth*10.));
        // if (uv.x < cell) color = vec3(fract(depth)*5.);
        // else if (uv.x < 2.*cell) color = fract(abs(pos.xyz)*5.);
        if (uv.x < cell) color = normal*.5+.5;
        else if (uv.x < 2.*cell) color = tint;
        else if (uv.x < 3.*cell) color = (glow + light);
        else color = vec3(ao);
        // color = vec3(depth/farClip, 0, material);
    }
    
    // depth /= farClip;
    // float lod = 200.;
    // color = vec3(floor(depth*lod)/lod, fract(depth*lod), material);

    gl_FragColor = vec4(color, 1);
}
`+"";