const toolbox = require("tinytoolbox");

class CustomStorageManager {
	TransactionRate = 1500; // Commit Storage Transaction Interval, will only commit if there is a difference.

	TransactionQueue = [
		/*
		{
			target: "", 						(Object of localStorage)
			data: "hello" | {hello: "world"},	(Data to be comitted)
			type: string | json,					(Data Type)
			timestamp: Date.now()
		}
		*/
	]

	Storage = {};

	async _commit() {
		if (this.TransactionQueue.length < 1) return console.log(`[CStorage -> _commit()] Nothing to Commit`);

		console.log(`[CStorage -> _commit()] Processing '${this.TransactionQueue.length}' Transaction${this.TransactionQueue.length < 1 ? '' : 's'}`);
		await Promise.all(this.TransactionQueue.map((Transaction) => {
			return new Promise((resolve) => {
				if (Transaction.type == "string") {
					localStorage[Transaction.target] = Transaction.data;
				} else {
					localStorage[Transaction.target] = JSON.stringify(Transaction.data);
				}
				console.log(`[CStorage -> _commit()] Comitted TID: ${Transaction.id}`);
				resolve();
			})
		}))
		return;
	}
	_flush() {
		if (this.TransactionQueue.length < 1) return console.log(`[CStorage -> _flush()] Nothing to Flush`);

		this.TransactionQueue = [];
		console.log(`[CStorage -> _flush()] Flushed Transaction Queue`);
		return;
	}

	constructor() {
		console.log(`[CStorage -> constructor] Hello World! \n${new Date()}`);
	}

	set(Target,Data) {
		this.Storage[Target] = Data;
		let pushdata = {
			target:Target,
			data:Data,
			type: typeof Data == 'object' ? 'json' : 'string',
			timestamp: Date.now(),
			id: toolbox.stringGen(12,3),
		}
		this.TransactionQueue.push(pushdata)
		return pushdata;
	}
	get(Target) {
		return this.Storage[Target];
	}
}
module.exports = CustomStorageManager;