const Discord = SB.modules.node.discord;
async function asyncForEach (array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array)
	}
}
function configInit(){
	var defaultConfig = {
		timeline: [],
		linkedUsers: [
			/*
			{
				apexID: <string>,
				discord: <message.author>,
				initalData: <json>,
				currentData: <json>
			}
			*/
		],
	}
	var found = false;
	SB.core.store.all.forEach((s)=>{
		if (s.label.toLowerCase() == 'apex' && s.data.linkedUsers != undefined) {
			found = true;
		}
	})
	if (!found) {
		setTimeout(()=>{
			if (SB.core.store.fetch('apex').data.timeline == undefined || SB.core.store.fetch('apex').data.linkedUsers.length == 0) {
				SB.core.store.set("apex",defaultConfig);
			}
		},500)
	}
}

module.exports = async function() {
	const prefix = SB.prefix.default;
	var t_api = require("apexlegends-api")
	const apexAPI = new t_api(SB.token.apex)
	const objQueue = require("./cacheQueue")
	SB.client.on('ready',()=>{
		try {

			var cacheRefresh = require("./cacheRefresh")
			//configInit();
			cacheRefresh.all()
		} catch (e) {
			console.error(e);
		}
	})

	SB.client.on('message', async message => {
		if (message.author.bot) return;
		if (message.content.indexOf(prefix) !== 0) return;
		var args = message.content.slice(prefix.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();
		try {
			switch (command) {
				case "clear":
					if (SB.prefrences.core.admins.find(u => u == message.author.id.toString()) == undefined) return;
					message.channel.startTyping()
					var previousCount = 0;
					console.log(SB.core.store.fetch('apex').data);
					if (SB.core.store.fetch('apex').data.linkedUsers != undefined) {
							previousCount = SB.core.store.fetch('apex').data.linkedUsers.length;
					}
					SB.core.store.set('apex',{data:{linkedUsers:[],timeline:[]}});
					message.channel.stopTyping()
					message.channel.send(`Cleared storage, deleted ${previousCount} linked user(s)`)
					break;
				case "link":
					if (SB.prefrences.core.admins.find(u => u == message.author.id.toString()) == undefined) return;
					if (args[0] == undefined) {
						// print help message
						message.reply(`No username was given, try adding your OriginID at the end of the command, Try doing '=link <OriginID Here>'. For more help ping <@230485481773596672>`)
						return;
					}
					var found = false;
					var store = await SB.core.store.fetch('apex').data;
					var lauth = message.author;
					if (args[1] != undefined) {
						lauth =  message.mentions.users.first() || SB.client.users.cache.get(args[1]);
						if (lauth == undefined) {
							message.reply("idk what happened lol");
						}
					}
					if (!found) {
						// Push new username
						var t_apex = await apexAPI.fetchUser(args[0]);
						if (t_apex.error) {
							// Error
							message.reply("An error happened. <@230485481773596672>")
						}

						var t_apexlinked = [];
						if (store.data.linkedUsers == undefined) {
							store.data.linkedUSers = [];
						}
						store.data.linkedUsers.forEach(u => t_apexlinked.push(u))

						t_apexlinked.push({
							discord: lauth,
							apexID: args[0],
							data: t_apex.data
						})
						console.log(t_apexlinked);
						SB.core.store.set('apex',{data:{timestamp: Date.now()/1000, linkedUsers: t_apexlinked, timeline: store.data.timeline}});
						message.channel.send(`Linked User ${args[0]} to Discord "${lauth.username}#${lauth.discriminator}" with the snowflake of ${lauth.id}`)
						return;
					}
					break;
				case "start":
						if (SB.prefrences.core.admins.find(u => u == message.author.id.toString()) == undefined) return;
						message.channel.starttyping();
						var apexStorage = await SB.core.store.fetch('apex').data;
						var t_linkedUsers = [];
						apexStorage.data.linkedUsers.forEach((u)=>{ t_linkedUsers.push(u) })
						await asyncForEach(t_linkedUsers,(user)=>{
							if (user.startData != undefined) return;
							user.startData = user.latestData;
						})
						SB.core.store.set('apex',{linkedUsers:t_linkedUsers})
						message.channel.send("Tournament has started!");
						break;
				case "finalize":
					return;
					if (SB.prefrences.core.admins.find(u => u == message.author.id.toString()) != undefined) {
						message.channel.stopTyping()
						message.channel.startTyping()
						// i am da god
						var data = SB.core.store.fetch('apex').data.data;
						var newData = []
						var discordMessage = new Discord.MessageEmbed()
							.setTitle("All User Results")
							.setTimestamp()
							.setFooter(`${data.linkedUsers.length} Attendees Participating`)
						await asyncForEach(data.linkedUsers,async (t_user)=>{
							try {
								var user = t_user;
								var t_user = await apexAPI.fetchUser(user.apexID)
								if (t_user.error) {
									message.channel.send("An error occoured. Check console :heart:. <@230485481773596672>")
									process.exit(1)
								}
								user.currentData = t_user.data;
								newData.push(user);
							} catch (e) {
								console.error(e);
							}
						})

						newData.sort((a,b)=>{
							return b.currentData.total.kills.value - a.startData.total.kills.value;
						})

						var currentPlacement = 1;
						console.log(data);
						newData.forEach(async(user)=>{
							try {
								var objectEntries = Object.entries(user.currentData.legends.all)
								var cachedLegends = 0;
								objectEntries.forEach((entry)=>{
									if (entry[1].data != undefined) {
										cachedLegends++;
									}
								})
								console.log(user);
								var AccuracyMsg = `**WARNING** Total KCC Accuracy; \n${Math.round((cachedLegends / objectEntries.length) *100)}% acc (${cachedLegends}/${objectEntries.length} legends)`;
								if (user.allReady) {
									AccuracyMsg = `100% Total KCC (${objectEntries.length}/${objectEntries.length} legends)`
								}
								discordMessage.addField(
									`${user.discord.username}#${user.discord.discriminator} (${user.discord.id})`,
									`${AccuracyMsg}\n
									***Placement*** ${currentPlacement}
									**Apex Username** ${user.apexID}
									**Previous Kills** ${user.startData.total.kills.value}
									**Current Kills** ${user.currentData.total.kills.value}
									**Difference** ${user.currentData.total.kills.value - user.startData.total.kills.value}`)
							} catch(e) {
								console.error(e);
							}
							currentPlacement++;
						})

						message.channel.send(discordMessage)
						message.channel.stopTyping()
					}
					break;
			}
		} catch(e) {
			console.error(e);
		}

	})


	SB.client.on('ready', async () => {
		SB.con.module.bot.loaded("Apex Tab");
	})
}
