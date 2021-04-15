const toolbox = require("tinytoolbox");
const apex = require("apexlegends-api");
var api = new apex(require("./token.json").apex);
var RawData = require("./store.json").find(s => s.label == "apex").data.data;

var FormattedUsers = [
	/*
	{
		discord: // Discord Data
		start: // Apex Start Data
		end: // Apex End Data
	}
	*/
]

RawData.linkedUsers.forEach((User)=>{
	FormattedUsers.push({
		discord: User.discord,
		start: User.startData || RawData.timeline.find(t => t.linkedUsers.find(d => d.discord.id = User.discord.id).discord.id == User.discord.id).linkedUsers.find(d => d.discord.id = User.discord.id).data,
		end: {}
	});
})

var UserQueue = new toolbox.queue({log:true});

FormattedUsers.forEach((User)=>{
	UserQueue.add(()=>{
		return new Promise((res)=>{
			setTimeout(async ()=>{
				var EndData = await api.fetchUser(User.start.global.name);
				var NewUser = User;
				if (NewUser.start == undefined)
				{
					NewUser.start = RawData.timeline.find(t => t.linkedUsers.find(d => d.discord.id = User.discord.id).discord.id == User.discord.id).linkedUsers.find(d => d.discord.id = User.discord.id).data;
				}
				NewUser.end = EndData.data;
				FormattedUsers[FormattedUsers.indexOf(User)] = NewUser;
				res();
			},1500)
		})
	})
})

while (UserQueue.storage.items.length == FormattedUsers.length)
{
	UserQueue.start(()=>{
		var SortedUsers = FormattedUsers;
		SortedUsers = SortedUsers.sort(o => o.end.total.kills - o.start.total.kills);

		SortedUsers.forEach(o => console.log(`${SortedUsers.indexOf(o)+1}: ${o.start.global.name} (@${o.discord.username}#${o.discord.discriminator}) (start: ${o.start.total.kills.value}, end: ${o.end.total.kills.value})`))
	});
	break;
}