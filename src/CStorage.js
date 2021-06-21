const toolbox = require("tinytoolbox");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const fs = require("fs");

class CustomStorageManager {
	constructor(StorageLocation) {
		this.StorageLocation = StorageLocation;
		console.log(`[CStorage -> constructor] Hello World! \n${new Date()}`);
	}

	async connect() {
		console.log(this.StorageLocation);
		if (!fs.existsSync(this.StorageLocation)) {
			var splitlocation = this.StorageLocation.split('/');
			splitlocation[splitlocation.length - 1] = undefined;
			fs.mkdirSync(splitlocation.join(' '),{recursive:true});
		}
		this.DBJS = await sqlite.open({
			filename: this.StorageLocation,
			driver: sqlite3.Database
		})
		await this.DBSetup();
	}

	async DBSetup() {

await this.execute(`
CREATE TABLE IF NOT EXISTS UserCache(
	"ID"	INTEGER NOT NULL DEFAULT 0 UNIQUE,
	"DISCORD_USERNAME"	TEXT DEFAULT 'Invalid User',
	"DISCORD_ID" INTEGER DEFAULT 488187472514252811,
	"DISCORD_DISCRIMINATOR"	INTEGER DEFAULT 0001,
	"DISCORD_AVATAR"	TEXT DEFAULT 'https://via.placeholder.com/300',
	"DISCORD_CREATEDAT"	INTEGER DEFAULT 1064984400,
	"DISCORD_JOINEDAT"	INTEGER DEFAULT 1536463363532,
	"ORIGIN_USERNAME"	TEXT DEFAULT 'InvalidUsername',
	PRIMARY KEY("ID" AUTOINCREMENT)
);`);
await this.execute(`
CREATE TABLE IF NOT EXISTS UserEvent(
	"ID"	INTEGER NOT NULL DEFAULT 0 UNIQUE,
	"DISCORD_ID"	INTEGER NOT NULL DEFAULT 488187472514252811,
	"EVENT"	BLOB NOT NULL,
	"CONTEXT"	BLOB NOT NULL,
	"TIMESTAMP"	INTEGER NOT NULL,
	PRIMARY KEY("ID" AUTOINCREMENT)
);`);
await this.execute(`
CREATE TABLE IF NOT EXISTS UserLeaderboard(
	"ID"	INTEGER NOT NULL DEFAULT 0 UNIQUE,
	"DISCORD_ID"	INTEGER,
	"DATAPOINT"	BLOB,
	"DATA"	BLOB,
	"TIMESTAMP"	INTEGER,
	PRIMARY KEY("ID" AUTOINCREMENT)
);`);
	console.log(`[CStorage -> DBSetup] Complete!`);
	}

	events = {
		/*
		"eventName": [ callback() ]
		*/
	};

	on(eventName,...callback) {
		if (eventName == undefined) return new Error("Event is Undefined");
		if (callback == undefined) return new Error("Callback is undefined");
		if (data.length == 1) {
			this.events[eventName].push(callback[0]);
		} else {
			this.events[eventName].concat(callback);
		}
	}
	send(eventName,...data) {
		if (eventName == undefined) return new Error("Event is Undefined");
		if (data == undefined) return new Error("Event Data is Undefined");
		if (data[0] == undefined) {
			this.events[eventName].forEach(e => e(data[0]));
		} else {
			this.events[eventName].forEach(e => e(data));
		}
	}
	close() {
		return new Promise(async (resolve) => {
			await this.DBJS.close();
			console.log(`[CStorage -> close] Goodbye!`);
		})
	}

	query(DatabaseStatement) {
		console.log(DatabaseStatement);
		return new Promise(async (resolve,reject) => {
			var q;
			try {
				if (DatabaseStatement.length[0] == undefined) {
					q = await this.DBJS.get(DatabaseStatement[0]);
				} else {
					q = await this.DBJS.get(DatabaseStatement.join(' '));
				}
			} catch(e) {
				reject(e);
			}

			resolve(q);
		})
	}
	all(DatabaseStatement) {
		console.log(DatabaseStatement);
		return new Promise(async (resolve,reject) => {
			var q;
			try {
				if (DatabaseStatement.length[0] == undefined) {
					q = await this.DBJS.all(DatabaseStatement[0]);
				} else {
					q = await this.DBJS.all(DatabaseStatement.join(' '));
				}
			} catch(e) {
				reject(e);
			}

			resolve(q);
		})
	}
	execute(DatabaseStatement) {
		return new Promise( async(resolve,reject) => {
			console.log(DatabaseStatement);
			try {
				if (DatabaseStatement.length[0] == undefined) {
					await this.DBJS.exec(DatabaseStatement[0]);
				} else {
					await this.DBJS.exec(DatabaseStatement.join(' '));
				}
			} catch(e) {
				reject(e);
			}
			resolve();
		})
	}
}
module.exports = CustomStorageManager;