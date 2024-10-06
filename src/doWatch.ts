import { workerSteam } from "./modules/steam/workerSteam.js";
import { disableGuard } from "./modules/steam/disableGuard.js";

export const doWatch = async () => {
	console.log("doWatch");

	await workerSteam("2", disableGuard);
	// const code = await workerMail(getAuthCode, "1");
	// console.log("code", code);
	//const nonActive = (await getNonActive()) ?? [];
	//nonActive.forEach((x) => console.log("account - ", x.login, " - ", x.password, " can sell"));
};
