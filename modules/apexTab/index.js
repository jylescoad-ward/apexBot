const Discord = SB.modules.node.discord;
function simpleStringify (object){
    var simpleObject = {};
    for (var prop in object ){
        if (!object.hasOwnProperty(prop)){
            continue;
        }
        if (typeof(object[prop]) == 'object'){
            continue;
        }
        if (typeof(object[prop]) == 'function'){
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
};
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
		SB.core.store.set("apex",defaultConfig);
	}
}

module.exports = async function() {
	const prefix = SB.prefix.default;
	var t_api = require("apexlegends-api")
	const apexAPI = new t_api(SB.token.apex)
	SB.client.on('ready',()=>{
		configInit();
	})

	SB.client.on('message', async message => {
		if (message.author.bot) return;
		if (message.content.indexOf(prefix) !== 0) return;
		var args = message.content.slice(prefix.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();

			switch (command) {
				case "link":
					if (args[0] == undefined) {
						// print help message
						message.reply(`No username was given, try adding your OriginID at the end of the command, Try doing '=link <OriginID Here>'. For more help ping <@230485481773596672>`)
						return;
					}
					var found = false;
					var store = await SB.core.store.fetch('apex');
					console.log(store)
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
						}

						var t_apexlinked = [];
						console.log('dastore',store)
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
								console.log(t_user.data);
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
							console.log(user)
							discordMessage.addField(`${user.discord.username}#${user.discord.discriminator} (${user.discord.id})`,`***Placement*** ${currentPlacement}\r\n**Apex Username** ${user.apexID}\r\n**Previous Kills** ${user.initalData.total.kills.value}\r\n**Current Kills** ${user.currentData.total.kills.value}\r\n**Difference** ${user.currentData.total.kills.value - user.initalData.total.kills.value}`)
							currentPlacement++;
						})

						message.channel.send(discordMessage)
					}
					break;
			}
		

	})


	SB.client.on('ready', async () => {
		SB.con.module.bot.loaded("Apex Tab");
	})
}
