
var glsl = x => x;

export const shaderTimeDateVertex = glsl`
    
    attribute vec2 texcoord;
    uniform vec2 resolution, scale, offset;
    varying vec2 uv;

    void main() {
        float aspect = resolution.x/resolution.y;
        uv = ((texcoord-.5)*vec2(aspect, 1)*2.5)*.5+.5;
        vec2 pos = texcoord * 2. - 1.;
        gl_Position = vec4(pos, 0, 1);
    }

`;

export const shaderTimeDatePixel = glsl`
    
    uniform float time, elapsed, fadeIn, fadeOut, blend;
    uniform vec2 resolution, cursor;
    uniform sampler2D image, blueNoise, frostMap, noiseMap;
    varying vec2 uv;

    void main() {
        vec3 color = vec3(0);
        vec3 blue = texture2D(blueNoise, gl_FragCoord.xy/1024.).rgb;
        vec2 pos = uv;
        vec2 p;

        // lens zoom
        // pos -= 0.5;
        // pos *= 1.+.9*length(pos);
        // pos += 0.5;

        vec2 mous = cursor * 2. - 1.;
        mous.x *= resolution.x / resolution.y;
        mous *= -1.;
        
        // frost effect
        // vec2 p = abs(mod(pos+1.,2.)-1.);
        // float frost = texture2D(frostMap, p).r;// + blue.z*.1;
        // float a = 6.28*frost;
        // float strength = 10./resolution.y;
        float lele = length(pos-.5);
        // // strength *= ss(.0,.5,lele);
        // pos += strength*vec2(cos(a),sin(a))*ss(.5,.4,lele);
        p = pos;
        p -= 0.5;
        p *= .1-1.*length(p)+.5;
        p *= rot(lele*2.);
        p += 0.5;
        p -= .02*elapsed;
        p = abs(mod(p+1.,2.)-1.);
        float noise = texture2D(noiseMap, p).r;
        vec3 tint = 0.5 + 0.5 * cos(vec3(0,.3,.6)*6.28 + lele*15. + pos.y*5. + noise * 2. + time * 0.1);
        color.rgb += tint * ss(0.2,.5,lele) * ss(.5,.4,lele) * ss(.3,.8,noise) * 2.;
        
        // text
        vec4 map = texture2D(image, pos);
        color += map.rgb*map.a;

        // panorama
        // p = pos-.5;
        // // vec3 dir = normalize(vec3(p, -lele*lele*1.));
        // vec3 dir = vec3(lele*2., sin(((atan(p.y,p.x)/3.14)*.5+.5)*3.14)*.05, 0.);
        // // dir.xz *= rot(time);
        // // dir.yz *= rot(time);
        // vec3 pano = texture2D(panoramaMap, dir.xy).rgb;
        // vec3 offset = pano * 6.28;
        // vec3 tint = 0.5 + 0.5 * cos(vec3(0.,.3,.6)*6.28 + dir * 6.28 + offset);
        // color.rgb += tint * ss(0.0, 0.6, luminance(pano));

        // light
        p = pos;
        // p *= rot(blue.z*.4-.1);
        p -= vec2(.75);
        float light = (.01+sin(blue.z*3.14)*.02)/length(p);
        float len = length(pos-.5);//+blue.z*.1;
        color.rgb += light;// * ss(0.5, 0.8, len);

        // crop
        color *= step(lele, .5);

        color *= fadeIn * (1.-fadeOut);

        gl_FragColor = vec4(color, 1);
    }

`