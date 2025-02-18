import { delay } from "../../utils/delay.js";
import { disableGuard } from "./disableGuard.js";
import { SteamModuleArgumentsType } from "./workerSteam.js";

export const checkAndDisableGuard = (props: SteamModuleArgumentsType) => {
	const { steamClient, resolver } = props;

	steamClient.on("loggedOn", async () => {
		await delay(3000);

		const guardDetail = await steamClient.getSteamGuardDetails();

		if (guardDetail.isSteamGuardEnabled) {
			console.log("has steam guard");
			disableGuard(props);
		} else {
			steamClient.logOff();
			resolver(true);
		}
	});
};
