class queue {
	UIDGen(length) {
			var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
			var retVal = "";
			for (var i = 0, n = charset.length; i < length; ++i) {
				retVal += charset.charAt(Math.floor(Math.random() * n));
			}
			return retVal;
	}
	constructor(config) {
		/*
		config: {
			threads: <int> // How many tasks can be done at once
		}
		*/
		this.UID = UIDGen(8);
		this.threads = config.threads;

		return this.UID;
	}
	add (callBack) {
		// Add this callback to the queue
	}
}