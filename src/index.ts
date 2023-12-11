import cron from "node-cron";
import { doWatch } from "./doWatch.js";

const task = cron.schedule("* * 3 * * *", doWatch, { runOnInit: true });

task.start();
