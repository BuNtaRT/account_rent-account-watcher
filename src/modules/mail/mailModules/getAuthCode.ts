import { createRequire } from "module";
import quotedPrintable from "quoted-printable";
import * as cheerio from "cheerio";

const require = createRequire(import.meta.url);
const utf8 = require("utf8");

export const getAuthCode = (buffer: string) => {
	try {
		const decodeMessage = utf8.decode(quotedPrintable.decode(buffer));

		const $ = cheerio.load(decodeMessage);
		const code = $(".title-48.c-blue1.fw-b.a-center")
			.last()
			.html()
			?.replace(/[ \t\n\r]/g, "")
			.trim();

		if (!code) return false;

		return code;
	} catch {
		return false;
	}
};
