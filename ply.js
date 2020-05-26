
window.onload = function() {

	var request = new XMLHttpRequest();
	request.open("GET", "ply/boulette.ply", true);
	request.responseType = "arraybuffer";
	request.onload = function(e) {
		var index = request.responseURL.indexOf('data');
		var letter = request.responseURL.substr(index).split('/')[1];

		var bitReader = new BitReader(request.response);
		var lineText = "";
		var vertexCount = 0;
		var colorDataCount = 3;
		var positions = [];
		var normals = [];
		var colors = [];
		var header = true;
		var index = 0;
		while (bitReader.byteIndex < bitReader.uint8Array.length) {
			if (header) {
				var v = String.fromCharCode(bitReader.read(8));
				if (v == '\n') {
					if (lineText.includes("end_header")) {
						header = false;
					} else if (lineText.includes("element vertex")) {
						var array = lineText.split(' ');
						if (array.length > 0) {
							var subtractor = array.length - 2;
							vertexCount = (array [array.length - subtractor]);
							var view = new DataView(new ArrayBuffer(vertexCount));
						}
					} else if (lineText.includes("property uchar alpha")) {
						colorDataCount = 4;
					}
					lineText = "";
				} else {
					lineText += v;
				}
			} else {
				// view.setUint32(bitReader.read(32), bitReader.read(32), bitReader.read(32));
				// view.setUint32(bitReader.read(32), bitReader.read(32), bitReader.read(32));
				// view.setUint8(bitReader.read(8), bitReader.read(8), bitReader.read(8));
				// positions.push(bitReader.read(32), bitReader.read(32), bitReader.read(32));
				// normals.push(bitReader.read(32), bitReader.read(32), bitReader.read(32));
				// colors.push(bitReader.read(8)/255, bitReader.read(8)/255, bitReader.read(8)/255);
				if (colorDataCount == 4) {
					bitReader.read(8);
					view.push(bitReader.read(8));
				}
			}
		}
		console.log(view.getFloat32(0));

		const canvas = document.getElementById("canvas");
		const gl = canvas.getContext("webgl");
		const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
		const geometry = { position:positions };
		// const count = 10000;
		// for (var v = 0; v < count; ++v) {
		// 	geometry.position.push(Math.random(),Math.random(),Math.random());
		// }
		const bufferInfo = twgl.createBufferInfoFromArrays(gl, geometry);
		var cameraDistance = 5;
		var deltaTime = 0.01;
		var camera = twgl.m4.lookAt([0, 0, 5], [0, 0, 0], [0, 1, 0]);
		var world = twgl.m4.identity();
		var projection, viewProjection;
		var cameraAngle = [0,0];
		var uniforms = {
			time: 0,
			resolution: [1,1],
			world: twgl.m4.identity(),
			viewProjection: 0,
		};
		function lerp(a,b,r) {
			return a * (1-r) + b * r;
		}
		function render(elapsed) {
			elapsed /= 1000;
			deltaTime = elapsed - uniforms.time;
			uniforms.time = elapsed;
			mouse.update();
			cameraAngle[0] = lerp(cameraAngle[0], (-(mouse.x / gl.canvas.width)*2.-1.)*2., 0.2);
			cameraAngle[1] = lerp(cameraAngle[1], (-(mouse.y / gl.canvas.height)*2.-1.)/4., 0.2);
			twgl.m4.rotateY(twgl.m4.identity(), cameraAngle[0], camera);
			twgl.m4.rotateX(camera, cameraAngle[1], camera);
			twgl.m4.translate(camera, [0,0,cameraDistance], camera);
			viewProjection = twgl.m4.multiply(projection, twgl.m4.inverse(camera));
			uniforms.viewProjection = viewProjection;
			uniforms.world = twgl.m4.rotationY(elapsed/10.);

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
		}

		onWindowResize();
		window.addEventListener('resize', onWindowResize, false);
		canvas.onmousemove = mouse.onmove;
		canvas.onmousedown = mouse.onmousedown;
		canvas.onmouseout = mouse.onmouseout;
		canvas.onmouseup = mouse.onmouseup;
		canvas.onwheel = mouse.onwheel;
		requestAnimationFrame(render);

	}
	request.send();

}