import { createLogger } from "../../loggingMiddleware/log.js";

const logger = createLogger({ stack: 'backend' });

const VALID_TYPES = ['Event', 'Result', 'Placement'];
const PRIORITY_WEIGHT = {
	Placement: 3,
	Result: 2,
	Event: 1
};

export function validateNotificationPayload(payload) {
	try {
		logger.debug('service', 'Validating notification payload');

		if (!payload.studentIds || !Array.isArray(payload.studentIds) || payload.studentIds.length === 0) {
			return { valid: false, error: 'studentIds must be a non-empty array' };
		}

		if (!payload.message || typeof payload.message !== 'string' || payload.message.trim().length === 0) {
			return { valid: false, error: 'message must be a non-empty string' };
		}

		if (!payload.type || !VALID_TYPES.includes(payload.type)) {
			return { valid: false, error: `type must be one of ${VALID_TYPES.join(', ')}` };
		}

		logger.debug('service', `Validation passed`);
		return { valid: true };
	} catch (error) {
		logger.error('service', `Validation error: ${error.message}`);
		return { valid: false, error: error.message };
	}
}

export function calculatePriority(type) {
	const priority = PRIORITY_WEIGHT[type] || 0;
		logger.debug('service', `Priority: ${priority}`);
	return priority;
}

export function sortByPriority(notifications) {
	return notifications.sort((a, b) => {
		if (b.priority !== a.priority) {
			return b.priority - a.priority;
		}
		return new Date(b.timestamp) - new Date(a.timestamp);
	});
}

export function applyRecencyScoring(notifications) {
	const now = new Date();
	return notifications.map(notif => {
		const ageInDays = (now - new Date(notif.timestamp)) / (1000 * 60 * 60 * 24);
		const recencyScore = Math.max(0, 10 - ageInDays);
		return {
			...notif,
			score: (notif.priority * 10) + recencyScore
		};
	});
}
