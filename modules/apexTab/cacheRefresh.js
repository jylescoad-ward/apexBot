const apexAPI = require("apexlegends-api")
var api = new apexAPI(SB.token.apex);
var customQueue = require("./cacheQueue");
async function asyncForEach (array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array)
	}
}

module.exports.all = () => {
	var queue = new customQueue({log:true});
	queue.add(module.exports.refreshRemoteCache)
	queue.add(module.exports.killUpdate)
	var loopFunction = async () => {
		setTimeout(()=>{
			queue.start(()=>{
				loopFunction();
			});
		},SB.prefrences.apex.intervalTimeout*1000)
	}
	loopFunction();
}

module.exports.refreshRemoteCache = async () => {
	var temp = SB.core.store.fetch('apex');
	var queue = new customQueue();
	await asyncForEach(temp.data.linkedUsers,(user)=>{
		var functionToPush = async () => {
			var temp = require("apexlegends-api");
			var api = new temp(SB.token.apex);
			var apiReturn = await api.fetchUser(user.apexID);

			return apiReturn;
		}
		queue.add(functionToPush)
	})
	await queue.start();
	return;
}
module.exports.killUpdate = ()=>{
	setTimeout(async ()=>{
		var temp = SB.core.store.fetch('apex');
		var tempAccounts = [];
		var done = false;
		var doneIndex = 0;
		var doneLimit = temp.data.linkedUsers.length;
		var queue = new customQueue();
		await asyncForEach(temp.data.linkedUsers,(i)=>{
			if (!i.allReady) {
				queue.add(async ()=>{
					var t_res = await api.fetchUser(i.apexID)
					if (t_res.error) {
						throw t_res;
					}
					if (t_res.data.global == undefined) return;
					var objectEntries = Object.entries(t_res.data.legends.all);
					var entiresIndex = 0;
					var entiresLength = objectEntries.length;
					objectEntries.forEach((e)=>{
						if (e[1].data != undefined) {
							entiresIndex++;
						}
					})
					i.allReady = false;
					if (entiresIndex == entiresLength) {
						// yo they actually selected all legends, a gold star for you!
						i.allReady = true;
					} else {
						var allLegends = {};
						Object.entries(i.initalData.legends.all).forEach((f)=>{
							if (f[1].data == undefined) {
								objectEntries.forEach((g)=>{
									if (f[0] == g[0]) {
										// if this is a new legend push the data we got.
										allLegends[f[0]] = g[1];
									}
								})
							} else {
								// if this is a legend we already have keep the data we have in store.json
								allLegends[f[0]] = f[1];
							}
						})
						i.initalData.legends.all = allLegends
						i.initalData = t_res.data;
					}
					tempAccounts.push(i);
					doneLimit++;
				})
			}
		})
		await queue.start();
		if (doneLimit === doneIndex) {
			done = true
		}
		if (done) {
			var dataToPush = {linkedUsers:tempAccounts}
			SB.core.store.set('apex',dataToPush)
		}
	},1500)
}