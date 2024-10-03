import { createRequire } from "module";
const require = createRequire(import.meta.url);

const utf8 = require("utf8");

import quotedPrintable from "quoted-printable";
import * as cheerio from "cheerio";

const getAuthCode = (buffer: string) => {
	try {
		const decodeMessage = utf8.decode(quotedPrintable.decode(buffer));
		const codeBlock = decodeMessage.split("<!-- Auth Code -->")[1].split("<!-- END Auth Code -->")[0];
		if (!codeBlock) return false;

		const $ = cheerio.load(codeBlock);
		const code = $("td")
			.last()
			.html()
			?.replace(/[ \t\n\r]/g, "");

		if (!code) return false;

		return code;
	} catch {
		return false;
	}
};

export default getAuthCode;
