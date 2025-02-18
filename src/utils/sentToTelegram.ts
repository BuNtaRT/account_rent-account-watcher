import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TG_TOKEN = process.env.TG_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

export const sendToTelegram = async (errorMessage: any) => {
	const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`;
	const params = {
		chat_id: CHAT_ID,
		text: `Вот тебе ошибка: ${errorMessage.message} \`\`\`
    ${JSON.stringify(errorMessage)}\`\`\``,
		parse_mode: "Markdown",
	};

	try {
		await axios.post(url, params);
		console.error("Error send in Telegram");
	} catch (error) {
		console.error("Can`t send error to Telegram ????:", error);
	}
};
