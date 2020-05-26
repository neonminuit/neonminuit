var BitReader = function (buffer) {

	this.uint8Array = new Uint8Array(buffer);
	this.bitIndex = 0;
	this.byteIndex = 0;

	this.readOneBit = function () {
		var b = (this.uint8Array[this.byteIndex] & (1 << this.bitIndex)) >> this.bitIndex;
		++this.bitIndex;
		if (this.bitIndex === 8) {
			this.bitIndex = 0;
			++this.byteIndex;
		}
		return b;
	};

	this.read = function (size) {
		var data = 0;
		for (var index = 0; index < size; ++index) {
			data |= this.readOneBit() << index;
		}
		return data;
	};
};