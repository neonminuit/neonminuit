
window.onload = function() {
	document.onmousemove = mouse.onmove;
	document.onmousedown = mouse.onmousedown;
	document.onmouseout = mouse.onmouseout;
	document.onmouseup = mouse.onmouseup;
	document.onwheel = mouse.onwheel;
}

const gl = document.getElementById("canvas").getContext("webgl");
const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
const geometry = { position:[] };
const count = 512.*424.;
for (var v = 0; v < count; ++v) {
	geometry.position.push(v/count,0,0);
}
const bufferInfo = twgl.createBufferInfoFromArrays(gl, geometry);
var cameraDistance = 5;
var deltaTime = 0.01;
var camera = twgl.m4.lookAt([0, 0, 5], [0, 0, 0], [0, 1, 0]);
var world = twgl.m4.identity();
var projection, viewProjection;
var video = setupVideo("Dance_0.82_2.97.mp4");
var videoReady = false;
var cameraAngle = [0,0];
var texture = twgl.createTexture(gl, {
	src: [0, 0, 255],
	format: gl.RGB,
	min: gl.NEAREST,
	mag: gl.NEAREST,
	wrap: gl.CLAMP_TO_EDGE,
});
var uniforms = {
	time: 0,
	resolution: [1,1],
	mouse: [0,0],
	video: texture,
	world: twgl.m4.identity(),
	gradient: twgl.createTexture(gl, { src: "clover.jpg" }),
	viewProjection: 0,
};
function render(elapsed) {
	elapsed /= 1000;
	deltaTime = elapsed - uniforms.time;
	uniforms.time = elapsed;
	mouse.update();
	// if (mouse.clic) {
		// cameraAngle[0] += mouse.delta.x * deltaTime / 4.;
		// cameraAngle[1] += mouse.delta.y * deltaTime / 4.;
	// }
	uniforms.mouse[0] = mouse.x / gl.canvas.width;
	uniforms.mouse[1] = mouse.y / gl.canvas.height;
	cameraAngle[0] = (-(mouse.x / gl.canvas.width)*2.-1.)/2.;
	cameraAngle[1] = (-(mouse.y / gl.canvas.height)*2.-1.)/4.;
	twgl.m4.rotateY(twgl.m4.identity(), cameraAngle[0], camera);
	twgl.m4.rotateX(camera, cameraAngle[1], camera);
	twgl.m4.translate(camera, [0,0,cameraDistance], camera);
	viewProjection = twgl.m4.multiply(projection, twgl.m4.inverse(camera));
	uniforms.viewProjection = viewProjection;
	uniforms.world = twgl.m4.rotationY(elapsed/10.);
	// uniforms.world = world;
	if (videoReady) {
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
	}
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.useProgram(programInfo.program);
	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0,0,0,1);
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
	twgl.setUniforms(programInfo, uniforms);
	twgl.drawBufferInfo(gl, bufferInfo, gl.POINTS);
	requestAnimationFrame(render);
}
function onWindowResize() {
	twgl.resizeCanvasToDisplaySize(gl.canvas);
	uniforms.resolution = [gl.canvas.width, gl.canvas.height];
	projection = twgl.m4.perspective(40 * Math.PI / 180, gl.canvas.width/gl.canvas.height, 0.01, 100.0);
	// viewProjection = twgl.m4.multiply(projection, twgl.m4.inverse(camera));
}
function setupVideo(url) {
  const video = document.createElement('video');
  var playing = false;
  var timeupdate = false;
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.addEventListener('playing', function() {
     playing = true;
     checkReady();
  }, true);
  video.addEventListener('timeupdate', function() {
     timeupdate = true;
     checkReady();
  }, true);
  video.src = url;
  video.play();
  function checkReady() {
    if (playing && timeupdate) {
      videoReady = true;
    }
  }
  return video;
}

onWindowResize();
window.addEventListener('resize', onWindowResize, false);
requestAnimationFrame(render);