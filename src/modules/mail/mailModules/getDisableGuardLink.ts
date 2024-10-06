import { createRequire } from "module";
import quotedPrintable from "quoted-printable";
import * as cheerio from "cheerio";

const require = createRequire(import.meta.url);
const utf8 = require("utf8");

export const getDisableGuardLink = (buffer: string) => {
	try {
		const decodeMessage = utf8.decode(quotedPrintable.decode(buffer));
		const $ = cheerio.load(decodeMessage);
		const link = $("a").eq(1).attr("href");

		if (!link?.includes("steamguarddisableverification")) return false;

		return link;
	} catch {
		return false;
	}
};
