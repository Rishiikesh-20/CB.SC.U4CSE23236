import { createLogger } from "../../loggingMiddleware/log.js";

const logger = createLogger({ stack: 'backend' });
export function optimizeSchedule(tasks, maxHours) {
	const n = tasks.length;
	logger.debug('service', `Optimizing ${n}T ${maxHours}H`);
	const dp = Array.from(
		{ length: n + 1 },
		() => Array(maxHours + 1).fill(0)
	);
	for (let i = 1; i <= n; i++) {
		const duration = tasks[i - 1].Duration;
		const impact = tasks[i - 1].Impact;
		for (let w = 0; w <= maxHours; w++) {
			if (duration <= w) {
				dp[i][w] = Math.max(
					dp[i - 1][w],
					impact + dp[i - 1][w - duration]
				);
			} else {
				dp[i][w] = dp[i - 1][w];
			}
		}
	}

	let w = maxHours;
	const selectedTasks = [];
	for (let i = n; i > 0; i--) {
		if (dp[i][w] !== dp[i - 1][w]) {
			selectedTasks.push(tasks[i - 1]);
			w -= tasks[i - 1].Duration;
		}
	}
	const result = {
		maxImpact: dp[n][maxHours],
		selectedTasks: selectedTasks.reverse()
	};
	logger.debug('service', `Complete - Impact:${result.maxImpact} Tasks:${result.selectedTasks.length}`);
	return result;
}