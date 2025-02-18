import { Builder, By, until } from "selenium-webdriver";
import { workerMail } from "../mail/workerMail.js";
import { getPassCode } from "../mail/mailModules/index.js";
import { AccountType } from "../../database/accounts.js";

export const seleniumChangePass = async (account: AccountType, updatedPassword: string): Promise<ResponseType> => {
	const { mail_id, login, password } = account;
	let driver = await new Builder().forBrowser("chrome").build();

	console.log(updatedPassword);
	await driver.get("https://store.steampowered.com/login");
	await driver.wait(until.elementLocated(By.xpath("//div[3]/div[1]/div/div/div/div[2]/div/form/div[1]/input")), 10000);
	await driver.sleep(3000);

	let usernameField = await driver.findElement(By.xpath("//div[3]/div[1]/div/div/div/div[2]/div/form/div[1]/input"));
	await usernameField.sendKeys(login);

	let passwordField = await driver.findElement(By.xpath("//div[3]/div[1]/div/div/div/div[2]/div/form/div[2]/input"));
	await passwordField.sendKeys(password);

	let loginButton = await driver.findElement(By.xpath("//div[3]/div[1]/div/div/div/div[2]/div/form/div[4]/button"));
	await loginButton.click();

	await driver.wait(until.elementLocated(By.xpath(`//*[@id="account_pulldown"]`)), 10000);

	await driver.get("https://store.steampowered.com/account/");
	await driver.wait(until.elementLocated(By.xpath("//div[2]/div[6]/div[1]/div[2]/div[2]/a")), 10000);

	const changePassBtn = await driver.findElement(By.xpath("//div[2]/div[6]/div[1]/div[2]/div[2]/a"));
	await changePassBtn.click();

	await driver.wait(until.elementLocated(By.xpath('//*[@id="wizard_contents"]/div/a[2]')), 10000);

	const sendMessageBtn = await driver.findElement(By.xpath('//*[@id="wizard_contents"]/div/a[2]'));
	await sendMessageBtn.click();
	try {
		await driver.wait(until.elementLocated(By.xpath('//*[@id="forgot_login_code_form"]/div[3]/input')), 10000);
	} catch (e) {
		const errorElement = await driver.findElement(By.xpath('//*[@id="error_description"]'));
		if (errorElement) return "request_expired";
		else return "fatal";
	}

	let changeCode = "";
	try {
		changeCode = await workerMail(getPassCode, mail_id);
	} catch (e) {
		return "request_expired";
	}

	let codeField = await driver.findElement(By.xpath(`//*[@id="forgot_login_code"]`));
	await codeField.sendKeys(changeCode);

	const acceptCodeButton = await driver.findElement(By.xpath(`//*[@id="forgot_login_code_form"]/div[3]/input`));
	await acceptCodeButton.click();

	await driver.wait(until.elementLocated(By.xpath(`//*[@id="password_reset"]`)), 10000);

	let newPassField = await driver.findElement(By.xpath(`//*[@id="password_reset"]`));
	await newPassField.sendKeys(updatedPassword);
	await driver.sleep(4000);

	let reTypeNewPassField = await driver.findElement(By.xpath(`//*[@id="password_reset_confirm"]`));
	await reTypeNewPassField.sendKeys(updatedPassword);
	await driver.sleep(1000);

	const confirmChangePassButton = await driver.findElement(By.xpath(`//*[@id="change_password_form"]/div[3]/input`));
	await confirmChangePassButton.click();

	try {
		await driver.wait(until.elementLocated(By.xpath(`//*[@id="wizard_contents"]/div/div[2]/div[1]`)), 10000);
	} catch (e) {
		await driver.wait(until.elementLocated(By.xpath(`//*[@id="responsive_page_template_content"]/div[3]/div/h2`)), 10000);
	}

	return "complete";
};

type ResponseType = "complete" | "request_expired" | "fatal";
