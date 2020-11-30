const Discord = SB.modules.node.discord;
const apexAPI = require("apextab-api").Apextab_API

function configInit(){
	var defaultConfig = {
		linkedUsers: [
			/*
			{
				apexID: <string>,
				discord: <message.author>,
				
			}
			*/
		],
	}
}

module.exports = async function() {
	const prefix = SB.prefix.default;

	SB.client.on('message', async message => {
		if (message.author.bot) return;
		if (message.content.indexOf(prefix) !== 0) return;
		var args = message.content.slice(prefix.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();

		try {
			switch (command) {
				case "link":
					if (args[0] == undefined) {
						// print help message
						message.reply(`No username was given, try adding your username at the end of the command. For more help ping <@230485481773596672>`)
						return;
					}
					if (config[message.author.id].apexUsername == args[0]) {
						// don't change username

						return;
					}
					if (config[message.author.id].apexUsername == undefined || config[message.author.id].apexUsername !== args[0]) {
						// Push new username

						return;
					}
					break;
			}
		} catch (err) {
			SB.modules.libraries.forEach(async (m) => {
				if (m.name === "developer_alerts") {
					require(`./../../${m.location}/${m.main}`).userspaceError(message, err);
				}
			})
		}

	})


	SB.client.on('ready', async () => {
		SB.con.module.bot.loaded("Apex Tab");
	})
}
