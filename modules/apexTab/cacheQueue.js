const { Message } = require("discord.js");

class queue {
	_UIDGen(length) {
			var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
			var retVal = "";
			for (var i = 0, n = charset.length; i < length; ++i) {
				retVal += charset.charAt(Math.floor(Math.random() * n));
			}
			return retVal;
	}
	_message(messageGiven) {
		this.storage.messages.push({timestamp:Date.now(),message:messageGiven});
		this.storage.currentMessage = {timestamp:Date.now(),message:messageGiven};
		return;
	}
	constructor(config) {
		this.storage = {
			UID: this._UIDGen(8),
			threads: config.threads || 1,
			items: [],
			messages: [],
			currentMessage: 'IDLE'
		}
		this._message(`QUEUE_NEW-${this.storage.UID}`);
		return this.storage;
	}
	add (callBack) {
		// Add this callback to the queue
		this.storage.items.push(callBack);
		this._message(`QUEUE_APPEND`);
	}
	clear (callBack) {
		this.storage.items = [];
		console.debug(`[cacheQueue] Cleared queue.`);
		this._message(`QUEUE_CLEAR`);
		callBack(this.storage);
	}
	async start(callBack) {
		// start the queue.
		if (this.storage.items.length < 1) {
			// Nothing was given ;w;
			throw "No items were queued";
		}
		this.storage.queueStart = Date.now()
		console.debug(`[cacheQueue] Found '${this.storage.items.length}' queued items.`);
		this._message(`QUEUE_RUN-START`)
		for (const obj of this.storage.items) {
			await obj();
			this._message(`QUEUE_RUN-OBJDONE`);
		}
		this._message(`QUEUE_RUN-END`);
		this._message(`IDLE`);
		console.debug(`[cacheQueue] Completed '${this.storage.items.length}' tasks.`);
		this.storage.queueEnd = Date.now()
		this.storage.queueDuration = this.storage.queueEnd - this.storage.queueStart;
		if (callBack != undefined) {
			callBack(this)
		} else {
			return this;
		}
	}
}