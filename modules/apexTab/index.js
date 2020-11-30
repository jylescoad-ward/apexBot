const Discord = SB.modules.node.discord;
async function asyncForEach (array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array)
	}
}
function configInit(){
	var defaultConfig = {
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
			if (SB.core.store.fetch('apex').data.linkedUsers.length == 0) {
				SB.core.store.set("apex",defaultConfig);
			}
		},500)
	}
}

module.exports = async function() {
	const prefix = SB.prefix.default;
	var t_api = require("apexlegends-api")
	const apexAPI = new t_api(SB.token.apex)
	SB.client.on('ready',()=>{
		try {
			configInit();
			require("./cacheRefresh.js").interval()
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
					if (message.author.id != 230485481773596672) return;
					message.channel.startTyping()
					var previousCount = SB.core.store.fetch('apex').data.linkedUsers.length
					SB.core.store.set('apex',{linkedUsers:[]})
					message.channel.stopTyping()
					message.channel.send(`Cleared storage, deleted ${previousCount} linked user(s)`)
					break;
				case "link":
					if (args[0] == undefined) {
						// print help message
						message.reply(`No username was given, try adding your OriginID at the end of the command, Try doing '=link <OriginID Here>'. For more help ping <@230485481773596672>`)
						return;
					}
					var found = false;
					var store = await SB.core.store.fetch('apex');
					store.data.linkedUsers.forEach((u)=>{
						if (u.discord.id == message.author.id) {
							// found, account linked already
							message.reply("User Already Linked, Ping <@230485481773596672> for help.");
							found = true
							return;
						}
					})
					if (!found) {
						// Push new username
						var t_apex = await apexAPI.fetchUser(args[0]);
						if (t_apex.error) {
							// Error

							message.reply("An error happened. <@230485481773596672>")
						}

						var t_apexlinked = [];
						store.data.linkedUsers.forEach(u => t_apexlinked.push(u))

						t_apexlinked.push({
							discord:message.author,
							apexID: args[0],
							initalData: t_apex.data
						})
						SB.core.store.set('apex',{linkedUsers: t_apexlinked})
						message.channel.send(`Linked User ${args[0]} to Discord "${message.author.username}#${message.author.discriminator}" with the snowflake of ${message.author.id}`)
						return;
					}
					break;
				case "finalize":
					if (message.author.id == 230485481773596672) {
						message.channel.stopTyping()
						message.channel.startTyping()
						// i am da god
						var data = SB.core.store.fetch('apex').data;
						var newData = []
						var discordMessage = new Discord.MessageEmbed()
							.setTitle("All User Results")
							.setTimestamp()
							.setFooter(`${data.linkedUsers.length} Attendees Participating`)
						await asyncForEach(data.linkedUsers,async (t_user)=>{
							var user = {
								discord: t_user.discord,
								apexID: t_user.apexID,
								initalData: t_user.initalData,
							};
							var t_user = await apexAPI.fetchUser(user.apexID)
							if (t_user.error) {
								message.channel.send("An error occoured. Check console :heart:. <@230485481773596672>")
								process.exit(1)
							}
							user.currentData = t_user.data;
							newData.push(user);
						})

						newData.sort((a,b)=>{
							return b.currentData.total.kills.value - a.initalData.total.kills.value;
						})

						var currentPlacement = 1;
						newData.forEach(async(user)=>{
							var objectEntries = Object.entries(user.currentData.legends.all)
							var cachedLegends = 0;
							objectEntries.forEach((entry)=>{
								if (entry[1].data != undefined) {
									cachedLegends++;
								}
							})
							var AccuracyMsg = `**WARNING** Total Kill Count Calculation Accuracy; \n${Math.round((cachedLegends / objectEntries.length) *100)}% accurate (${cachedLegends}/${objectEntries.length} legends)`;
							if (user.allReady) {
								AccuracyMsg = `100% Total Kill Count Calculation (${objectEntries.length}/${objectEntries.length} legends)`
							}
							discordMessage.addField(
								`${user.discord.username}#${user.discord.discriminator} (${user.discord.id})`,
								`${AccuracyMsg}\n
								***Placement*** ${currentPlacement}
								**Apex Username** ${user.apexID}
								**Previous Kills** ${user.initalData.total.kills.value}
								**Current Kills** ${user.currentData.total.kills.value}
								**Difference** ${user.currentData.total.kills.value - user.initalData.total.kills.value}`)
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
