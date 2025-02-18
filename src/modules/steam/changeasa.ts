import { AccountType } from "../../database/accounts.js";
import { workerMail } from "../mail/workerMail.js";
import { getPassCode } from "../mail/mailModules/index.js";
import axios, { AxiosResponse } from "axios";
import rsa from "node-rsa";
import * as cheerio from "cheerio";
import { delay } from "../../utils/delay.js";

const BROWSER = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";

export class SteamPasswordChanger {
	steam: Steam;
	account: AccountType;
	constructor(cookie: string[], sessionID: string, account: AccountType) {
		this.steam = new Steam(cookie, sessionID);
		this.account = account;
	}
	// Получаем параметры для смены пароля
	async _receivePasswordChangeParams() {
		const response = await axios.get("https://help.steampowered.com/wizard/HelpChangePassword?redir=store/account/", {
			headers: {
				Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
				Referer: "https://store.steampowered.com/",
				"User-Agent": BROWSER,
				cookie: this.steam.cookie,
			},
		});
		console.log("response.request ", response.request.res.responseUrl);

		if (response.request.res.responseUrl) {
			const url = new URL(response.request.res.responseUrl);
			const params = Object.fromEntries(url.searchParams.entries());
			return params as unknown as ParamsPasswordType;
		}

		setCookie(response, this.steam.cookie);
		throw "ошибка получения начальных параметров";
	}
	// Получаем кнопки для смены пароля
	async _getHelpWithSendCode(data: ParamsPasswordType) {
		const params = {
			s: data.s,
			account: data.account,
			reset: data.reset,
			issueid: data.issueid,
		};

		const response = await axios.get("https://help.steampowered.com/en/wizard/HelpWithLoginInfoSendCode", {
			headers: {
				Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
				Referer: "https://store.steampowered.com/",
				"User-Agent": BROWSER,
				cookie: this.steam.cookie,
			},
			params,
		});

		const page = response.data;

		setCookie(response, this.steam.cookie);

		const $ = cheerio.load(page);
		return $(".help_wizard_button.help_wizard_arrow_right").first().attr("href");
	}

	// Получаем форму и видимо это нужный этап
	async _getResetForm(data: ParamsPasswordType, link: string) {
		const params = {
			s: data.s,
			account: data.account,
			reset: data.reset,
			lost: 0,
			issueid: data.issueid,
			sessionid: this.steam.sessionId,
			wizard_ajax: 1,
			gamepad: 0,
		};

		//https://help.steampowered.com/ru/wizard/HelpWithLoginInfoEnterCode?s=1398196521860321004&account=1615825296&reset=1&lost=0&issueid=406
		const response = await axios.get("https://help.steampowered.com/ru/wizard/HelpWithLoginInfoEnterCode", {
			params,
			headers: {
				Accept: "*/*",
				"User-Agent": BROWSER,
				cookie: this.steam.cookie,
			},
		});

		setCookie(response, this.steam.cookie);

		console.log(response.data);
	}

	// Отправляем код для восстановления аккаунта
	async _sendAccountRecoveryCode(props: ParamsPasswordType) {
		let data = new URLSearchParams();
		data.append("sessionId", this.steam.sessionId);
		data.append("wizard_ajax", "1");
		data.append("gamepad", "0");
		data.append("s", props.s.toString());
		data.append("method", "2");
		data.append("link", "");

		try {
			// const response = await axios.post("https://help.steampowered.com/ru/wizard/AjaxSendAccountRecoveryCode", data, {
			// 	headers: {
			// 		Accept: "*/*",
			// 		"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			// 		Origin: "https://help.steampowered.com",
			// 		"X-Requested-With": "XMLHttpRequest",
			// 		cookie: [...this.steam.cookie, "steamAccountRecoveryRedir=https%3A%2F%2Fstore.steampowered.com%2Faccount%2F"],
			// 	},
			// });

			const response = await axios.post(
				"https://help.steampowered.com/en/wizard/AjaxSendAccountRecoveryCode",
				data.toString(), // Передача данных в формате строки для "application/x-www-form-urlencoded"
				{
					headers: {
						Accept: "*/*",
						"Accept-Encoding": "gzip, deflate, br, zstd",
						"Accept-Language": "en-RU,en;q=0.9,ru-RU;q=0.8,ru;q=0.7",
						Connection: "keep-alive",
						"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
						Host: "help.steampowered.com",
						Origin: "https://help.steampowered.com",
						Referer: `https://help.steampowered.com/ru/wizard/HelpWithLoginInfoEnterCode?s=${props.s}&account=${props.account}&reset=1&lost=0&issueid=406`,
						"Sec-Fetch-Dest": "empty",
						"Sec-Fetch-Mode": "cors",
						"Sec-Fetch-Site": "same-origin",
						"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
						"X-Requested-With": "XMLHttpRequest",
						"sec-ch-ua": `"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"`,
						"sec-ch-ua-mobile": "?0",
						"sec-ch-ua-platform": `"macOS"`,
						cookie: this.steam.cookie,
					},
				}
			);

			setCookie(response, this.steam.cookie);

			return response.data;
		} catch (e) {
			console.error(e);
		}
	}
	async _sendVerifyCode(props: ParamsPasswordType & { code: string }) {
		const params = {
			code: props.code,
			sessionId: this.steam.sessionId,
			reset: 1,
			lost: 0,
			wizard_ajax: 1,
			gamepad: 0,
			s: props.s,
			method: 2,
		};
		const response = await axios.get("https://help.steampowered.com/en/wizard/AjaxVerifyAccountRecoveryCode", {
			params,
			headers: {
				Origin: "https://help.steampowered.com",
				"User-Agent": BROWSER,
				cookie: this.steam.cookie,
			},
		});

		if (response.status !== 200) {
			throw "ошибка подтверждения " + response.data;
		}
	}

	// Получаем ключ RSA для шифрования пароля
	async _getRsaKey() {
		const data = {
			sessionId: this.steam.sessionId,
			username: this.account.login,
		};
		const response = await axios.post("https://help.steampowered.com/en/login/getrsakey/", data, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
				"User-Agent": BROWSER,
				cookie: this.steam.cookie,
			},
		});

		return response;
	}

	// Шифруем пароль с помощью RSA
	_encryptPassword(password: string, mod: string, exp: string) {
		const publicKey = new rsa();
		const key = publicKey.importKey({ n: Buffer.from(mod, "hex"), e: parseInt(exp, 16) }, "components-public");
		const encryptedPassword = key.encrypt(password, "buffer");
		return Buffer.from(encryptedPassword).toString("base64");
	}

	// Меняем пароль
	async _changePasswordRequest(props: ParamsPasswordType, encryptedPassword: string, rsatimestamp: number) {
		const data = {
			sessionId: this.steam.sessionId,
			wizard_ajax: 1,
			s: props.s,
			account: props.account,
			password: encryptedPassword,
			rsatimestamp: rsatimestamp,
		};

		const response = await axios.post("https://help.steampowered.com/en/wizard/AjaxAccountRecoveryChangePassword/", data, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
				Origin: "https://help.steampowered.com",
				"User-Agent": BROWSER,
				cookie: this.steam.cookie,
			},
		});

		console.log("response.request ", response.request);

		if (response.status !== 200) throw "ошибка при отправке пароля";
	}

	// Главный метод смены пароля
	async change(newPassword: string) {
		if (newPassword === this.account.password) {
			throw "New password cannot be the same as the old one";
		}

		const params = await this._receivePasswordChangeParams();
		const getMessageLink = await this._getHelpWithSendCode(params);
		if (!getMessageLink) throw "ссылки почему то на странице нет :<(";

		await this._getResetForm(params, getMessageLink);

		console.log("params", params);
		await delay(500);
		const responseReques = await this._sendAccountRecoveryCode(params);

		console.log("responseReques", responseReques);

		const code = await workerMail(getPassCode, this.account.mail_id.toString());

		console.log(code);
		await this._sendVerifyCode({ ...params, code });

		// Получаем ключ RSA и шифруем старый и новый пароли
		const resKey = await this._getRsaKey();
		console.log(resKey);
		const key = new RSAKey(resKey.data);

		const encryptedNewPassword = this._encryptPassword(newPassword, key.mod, key.exp);

		// Выполняем запрос на смену пароля
		await this._changePasswordRequest(params, encryptedNewPassword, key.timestamp);
	}
}

const setCookie = (response: AxiosResponse, oldCookie: string[]) => {
	const setCookieHeader = response.headers["set-cookie"];
	let cookies: string[] = [];

	if (setCookieHeader) {
		cookies = setCookieHeader.flatMap((cookie: string) => cookie.split(";"));
	}

	if (cookies.length) {
		console.log("Полученные cookies:", cookies);

		cookies.forEach((newCookie: string) => {
			const oldDataIndex = oldCookie.findIndex((cookie) => cookie.startsWith(newCookie.split("=")[0] ?? newCookie));

			if (oldDataIndex !== -1) oldCookie[oldDataIndex] = newCookie;
			else oldCookie.push(newCookie);
		});
	}
};

class Steam {
	sessionId: string;
	cookie: string[];
	constructor(cookie: string[], sessionID: string) {
		this.sessionId = sessionID;
		this.cookie = cookie;
	}
}

type ParamsPasswordType = {
	s: number;
	account: number;
	reset: number;
	issueid: number;
	lost: number;
};

class RSAKey {
	public mod: string;
	public exp: string;
	public timestamp: number;
	public token_gid: string;

	constructor(data: RsaResponseType) {
		// Маппируем значения полей
		this.mod = data.publickey_mod;
		this.exp = data.publickey_exp;
		this.timestamp = data.timestamp;
		this.token_gid = data.token_gid;
	}
}

type RsaResponseType = { publickey_mod: string; publickey_exp: string; timestamp: number; token_gid: string };
