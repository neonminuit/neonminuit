
export function loadFile(url, callback) 
{
	var request = new XMLHttpRequest();
	if (request.overrideMimeType) {
		request.overrideMimeType('text/plain');
	}

	function handleLoad(e) {
		callback(null, request.responseText);
	}

	function handleError(e) {
		callback(e);
	}

	// request.open('get', url, true);
	request.open('get', url + "?t=" + (new Date()).getTime(), true);
	request.addEventListener('load', handleLoad, false);
	request.addEventListener('error', handleError, false);
	request.send();
}

export function loadFiles(files, callback, callbackProgress) {
	var numToLoad = 0;
	var loadedFiles = {};

	function callbackOnce(err, content) {
		if (callback) {
			var cb = callback;
			callback = undefined;
			return cb(err, content);
		}
	};

	files.forEach(function(file) {
		++numToLoad;
		loadFile(file, function(err, content) {
			if (err) {
				// make sure we only call this once!
				return callbackOnce(err);
			}
			var fileNameArray = file.split('/');
			var fileName = fileNameArray[Math.max(0, fileNameArray.length - 1)];
			loadedFiles[fileName] = content;
			--numToLoad;
			if (callbackProgress) {
				callbackProgress(1 - numToLoad / files.length, fileName);
			}
			if (numToLoad == 0) {
				callbackOnce(null, loadedFiles);
			}
		})
	});
}

export function loadOBJ (url, callback)
{
	loadFile(url, function(error, data) {
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
		callback({
			position: { numComponents: 3, data: positions },
			texcoord: { numComponents: 2, data: uvs },
			indices: { numComponents: 3, data: indices },
		})
	})
}