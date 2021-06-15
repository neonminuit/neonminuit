
window.onload = function() {

	var request = new XMLHttpRequest();
	request.open("GET", "ply/boulette.ply", true);
	// request.responseType = "arraybuffer";
	request.onload = function(e) {
		var index = request.responseURL.indexOf('data');
		var letter = request.responseURL.substr(index).split('/')[1];
		console.log(request.response)
		var bitReader = new BitReader(request.response);
		var lineText = "";
		var vertexCount = 0;
		var colorDataCount = 3;
		var positions = [];
		var normals = [];
		var colors = [];
		var header = true;
		var offset = 0;
		var scale = 0.1;
		// property float x
		// property float y
		// property float z
		// property float nx
		// property float ny
		// property float nz
		// property uchar red
		// property uchar green
		// property uchar blue
		// property uchar alpha
		var stripe = 3*32+3*32+4*8;
		while (offset < request.response.length) {
		// while (bitReader.byteIndex < bitReader.uint8Array.length) {
			if (header) {
				var v = request.response[offset];//String.fromCharCode(bitReader.read(8));
				if (v == '\n') {
					if (lineText.includes("end_header")) {
						header = false;
						console.log(lineText)
					} else if (lineText.includes("element vertex")) {
						var array = lineText.split(' ');
						if (array.length > 0) {
							var subtractor = array.length - 2;
							vertexCount = (array [array.length - subtractor]);
							var view = new DataView(new ArrayBuffer(vertexCount*(3+3+4)));
						}
					} else if (lineText.includes("property uchar alpha")) {
						colorDataCount = 4;
					}
					lineText = "";
				} else {
					lineText += v;
				}
			} else {
				var v = request.response[offset];//String.fromCharCode(bitReader.read(8));
				if (v == '\n') {
					const datas = lineText.split(' ');
					positions.push(datas[0]*scale, datas[1]*scale, datas[2]*scale);
					normals.push(datas[3], datas[4], datas[5]);
					colors.push(datas[6], datas[7], datas[8], 1);
					lineText = "";
				} else {
					lineText += v;
				}
				// view.setFloat32(offset++, bitReader.read(32), true);
				// view.setFloat32(offset++, bitReader.read(32), true);
				// view.setFloat32(offset++, bitReader.read(32), true);
				// view.setFloat32(offset++, bitReader.read(32), true);
				// view.setFloat32(offset++, bitReader.read(32), true);
				// view.setFloat32(offset++, bitReader.read(32), true);
				// view.setUint8(offset++, bitReader.read(8), true);
				// view.setUint8(offset++, bitReader.read(8), true);
				// view.setUint8(offset++, bitReader.read(8), true);
				// // positions.push(bitReader.read(32), bitReader.read(32), bitReader.read(32));
				// // normals.push(bitReader.read(32), bitReader.read(32), bitReader.read(32));
				// // colors.push(bitReader.read(8)/255, bitReader.read(8)/255, bitReader.read(8)/255);
				// // if (colorDataCount == 4) {
				// 	view.setUint8(offset++, bitReader.read(8), true);
				// 	// view.setUint8(bitReader.read(8));
				// 	// view.push(bitReader.read(8));
				// 	;
				// // }
			}
			++offset;
		}
		// console.log(vertexCount);
		
		// for (var i = 0; i < vertexCount; ++i)
		// {
		// 	var ii = i;
		// 	positions.push(view.getFloat32(ii, true), view.getFloat32(ii+1, true), view.getFloat32(ii+2, true));
		// 	normals.push(view.getFloat32(ii+3, true), view.getFloat32(ii+4, true), view.getFloat32(ii+5, true));
		// 	colors.push(view.getFloat32(ii+6, true), view.getFloat32(ii+7, true), view.getFloat32(ii+8, true), view.getFloat32(ii+9, true));
		// }
		console.log(positions[0]);
		
		const canvas = document.getElementById("canvas");
		const gl = canvas.getContext("webgl");
		const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
		// const geometry = { position:[] };
		const geometry = { position:positions, normal: normals, color: colors };
		const count = 10000;
		// for (var v = 0; v < count; ++v) {
		// 	geometry.position.push(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1);
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