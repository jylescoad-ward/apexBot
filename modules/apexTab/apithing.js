const apexAPI = require("apexlegends-api")
var api = new apexAPI(SB.token.apex);
async function asyncForEach (array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array)
	}
}
module.exports.interval = ()=>{
	//setInterval(()=>{
		setTimeout(async ()=>{
			var temp = SB.core.store.fetch('apex');
			var tempAccounts = [];
			var done = false;
			var doneIndex = 0;
			var doneLimit = temp.data.linkedUsers.length
			await asyncForEach(temp.data.linkedUsers,async (i)=>{
				if (!i.allReady) {
					var t_res = await api.fetchUser(i.apexID)
					if (t_res.error) {
						throw t_res;
						return;
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
					}
					i.initalData = t_res.data;
					tempAccounts.push(i);
					doneLimit++;
				}
			})
			if (doneLimit === doneIndex) {
				done = true
			}
			if (done) {
				var dataToPush = {linkedUsers:tempAccounts}
				console.log("i pushed that",dataToPush)
				SB.core.store.set('apex',dataToPush)
			}
		},1500)
	//},SB.prefrences.apex.intervalTimeout)
}