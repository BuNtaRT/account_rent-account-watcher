import { createRequire } from "module";
const require = createRequire(import.meta.url);

import Connection, { ImapMessage } from "imap";
const Imap = require("Imap");
import getAuthCode from "./mailModules/getAuthCode.js";
import { delay } from "./delay.js";
import log from "./log/log.js";

export const InitMail = async (module: MailModuleType): Promise<string> =>
	new Promise(async (resolve, reject) => {
		await delay(1000 * 15);
		const user = "gamecoffee89";
		const password = "888888";

		function getLastMail() {
			const imap = new Imap({
				user: user,
				password: password,
				host: "imap.yandex.ru",
				port: 993,
				tls: true,
			});

			function openInbox(err: Error, box: Connection.Box) {
				if (err) reject(err.message);
				const fetchInbox = imap.seq.fetch(box.messages.total + ":*", { bodies: ["TEXT"], struct: true });

				fetchInbox.on("message", (message: ImapMessage) => {
					message.on("body", (stream, info) => {
						let buffer = "";

						stream.on("data", function (chunk) {
							buffer += chunk.toString();
						});
						stream.once("end", function () {
							const code = module(buffer);
							if (code) resolve(code);
						});
					});
				});

				fetchInbox.once("end", function () {
					imap.end();
				});
			}

			function errorConnection(err: Error) {
				console.log(err);
			}

			function endConnection() {
				console.log("Connection ended");
			}

			function ready() {
				imap.openBox("INBOX", true, openInbox);
			}

			imap.once("ready", ready);
			imap.once("error", errorConnection);
			imap.once("end", endConnection);

			imap.connect();
		}

		const getLastMailInterval = setInterval(getLastMail, 1000 * 30);

		setTimeout(
			() => {
				clearInterval(getLastMailInterval);
				reject("timeout");
			},
			1000 * 60 * 5
		);
	});

type MailModuleType = (val: string) => string | false;
