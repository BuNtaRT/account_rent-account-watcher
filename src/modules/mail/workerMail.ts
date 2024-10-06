import { createRequire } from "module";
import Connection, { ImapMessage } from "imap";
import { Mails } from "../../database/mails.js";
import { delay } from "../../utils/delay.js";

const require = createRequire(import.meta.url);

const Imap = require("Imap");

export const workerMail = async (module: MailModuleType, id: number): Promise<string> =>
	new Promise(async (resolve, reject) => {
		const mails = new Mails();
		const mailData = await mails.getBy(id);
		if (!mailData) throw `mail not found by id ${id}`;

		const mailType = mailData.address.split("@")[1];
		const host = mailType === "yandex.ru" ? "imap.yandex.ru" : "";
		const user = mailData.address.split("@")[0];
		const password = mailData.password;

		await delay(1000 * 10);
		getLastMail();
		function getLastMail() {
			const imap = new Imap({
				user,
				password,
				host,
				port: 993,
				tls: true,
			});

			function openInbox(err: Error, box: Connection.Box) {
				if (err) reject(err.message);
				const fetchInbox = imap.seq.fetch(box.messages.total + ":*", { bodies: ["TEXT"], struct: true });

				fetchInbox.on("message", (message: ImapMessage) => {
					message.on("body", (stream) => {
						let buffer = "";

						stream.on("data", function (chunk) {
							buffer += chunk.toString();
						});
						stream.once("end", function () {
							const code = module(buffer);
							if (code) {
								clearInterval(getLastMailInterval);
								resolve(code);
							}
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
