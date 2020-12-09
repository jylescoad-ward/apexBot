const sleep = require('util').promisify(setTimeout)

async function asyncForEach (array, callback) {
	for (let index = 0; index < array.length; index++) {
		callback(array[index], index, array)
	}
}

async function testOBJNum(obj) {
	if (obj == 1) {
		await sleep(1500);
		return obj
	} else {
		return obj
	}
}

var testOBJ = [
	1,
	2,
	3,
	4,
]

var testLoop = async ()=>{
	console.debug('start')
	//for (const item of testOBJ) {
		const promises = testOBJ.map(testOBJNum)
		var outOBJ = await Promise.all(promises)
		console.debug(outOBJ)
	//}
	console.debug('end')
}
testLoop();

/*
asyncForEach(["1","2","3"],async (obj)=>{
	if (obj == 1) {
		await setTimeout(()=>{
			console.debug(obj)
		},1500)
	} else {
		console.debug(obj)
	}
})
*/