import Connection, { ImapMessage } from "imap";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Imap = require("Imap");
import * as cheerio from "cheerio";
import quotedPrintable from "quoted-printable";
const utf8 = require("utf8");

export const InitMail = () => {
	console.log("initMail");
	const imap = new Imap({
		host: "imap.yandex.ru",
		port: 993,
		tls: true,
	});

	imap.once("ready", ready);

	function ready() {
		imap.openBox("INBOX", true, inbox);
	}

	function inbox(err: Error, box: Connection.Box) {
		console.log("inbox");
		if (err) throw err;
		const fetchInbox = imap.seq.fetch(box.messages.total + ":*", { bodies: ["HEADER.FIELDS (FROM)", "TEXT"], struct: true });

		fetchInbox.on("message", (message: ImapMessage, seqno: number) => {
			console.log("Message #%d", seqno);
			console.log("Message ", message);

			const prefix = "(#" + seqno + ") ";

			message.on("body", (stream, info) => {
				let buffer = "",
					count = 0;

				stream.on("data", function (chunk) {
					if (info.which === "TEXT") {
						count += chunk.length;
						buffer += chunk.toString();
					}
				});
				stream.once("end", function () {
					if (info.which === "TEXT") {
						const decodeMessage = utf8.decode(quotedPrintable.decode(buffer));
						const codeBlock = decodeMessage.split("<!-- Auth Code -->")[1].split("<!-- END Auth Code -->")[0];
						const $ = cheerio.load(codeBlock);
						const code = $("td")
							.last()
							.html()
							?.replace(/[ \t\n\r]/g, "");

						console.log(`-${code}-`);
					}
				});
			});

			message.once("end", () => {
				console.log(prefix + "Finished");
			});
		});

		fetchInbox.once("end", function () {
			imap.end();
		});
	}

	imap.once("error", function (err: Error) {
		console.log(err);
	});

	imap.once("end", function () {
		console.log("Connection ended");
	});

	imap.connect();
};
