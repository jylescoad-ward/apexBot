const sleep = require('util').promisify(setTimeout)

var testArray = [
	async () => {
		// slow one
		// sleep is emulating a http response, because its pretty fucking slow.
		await sleep(1500);
		return '1';
	},
	() => {
		return '2'
	},
]


var testFunction = async () => {
	console.log('start')
	for (const obj of testArray) {
		const returnValue = await obj();
		console.debug(returnValue);
	}
	console.log('end')
}

testFunction();