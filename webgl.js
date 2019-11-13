
const gl = document.getElementById("canvas").getContext("webgl");
const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
const geometry = { position:[] };
const count = 10000;
for (var v = 0; v < count; ++v) {
	geometry.position.push(v/count,0,0);
}
const bufferInfo = twgl.createBufferInfoFromArrays(gl, geometry);
var camera = twgl.m4.lookAt([0, 0, 5], [0, 0, 0], [0, 1, 0]);
var projection, viewProjection;
var video = setupVideo("Dance_0.82_2.97.mp4");
var videoReady = false;
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
	video: texture,
	viewProjection: 0,
};
function render(elapsed) {
	elapsed /= 1000;
	uniforms.time = elapsed;
	uniforms.world = twgl.m4.rotationY(elapsed/10.);
	if (videoReady) {
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
	}
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE);
	gl.useProgram(programInfo.program);
	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
	twgl.setUniforms(programInfo, uniforms);
	twgl.drawBufferInfo(gl, bufferInfo, gl.POINTS);
	requestAnimationFrame(render);
}
function onWindowResize() {
	twgl.resizeCanvasToDisplaySize(gl.canvas);
	uniforms.resolution = [gl.canvas.width, gl.canvas.height];
	projection = twgl.m4.perspective(70 * Math.PI / 180, gl.canvas.width/gl.canvas.height, 0.01, 100.0);
	viewProjection = twgl.m4.multiply(projection, twgl.m4.inverse(camera));
	uniforms.viewProjection = viewProjection;
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