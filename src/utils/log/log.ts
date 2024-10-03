const log = {
	error(...args: LogMessageType) {
		const message = JSON.stringify(args.join(""));

		console.error("ERROR: ", message);
	},
	log(...args: LogMessageType) {
		const message = JSON.stringify(args.join(""));

		console.log("LOG: ", message);
	},

	warning(...args: LogMessageType) {
		const message = JSON.stringify(args.join(""));

		console.log("WARNING: ", message);
	},
};

type LogMessageType = Array<boolean | string | number | object>;

export default log;
