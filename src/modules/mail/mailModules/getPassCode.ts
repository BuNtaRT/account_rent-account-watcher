import quotedPrintable from "quoted-printable";
import * as cheerio from "cheerio";
import utf8 from "utf8";

export const getPassCode = (buffer: string) => {
	try {
		const decodeMessage = utf8.decode(quotedPrintable.decode(buffer));

		if (!decodeMessage.includes("AccountRecoveryCode")) return false;

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
