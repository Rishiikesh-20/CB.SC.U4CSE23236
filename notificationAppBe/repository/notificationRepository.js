import { createLogger } from "../../loggingMiddleware/log.js";
import { sortByPriority, applyRecencyScoring } from "../service/notificationService.js";

const logger = createLogger({ stack: 'backend' });

const notificationsStore = [];

function generateId() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export async function initializeDatabase() {
	logger.info('repository', 'In-memory store ready');
}

export async function fetchNotifications(studentId) {
	try {
		logger.debug('repository', `Fetching ${studentId}`);
		const notifications = notificationsStore.filter(n => n.studentId === studentId);
		logger.debug('repository', `Retrieved ${notifications.length}`);
		return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
	} catch (error) {
		logger.error('repository', `Fetch: ${error.message}`);
		throw error;
	}
}

export async function fetchPriorityNotifications(studentId, limit = 10) {
	try {
		logger.debug('repository', `Priority ${studentId}`);
		const notifications = notificationsStore.filter(
			n => n.studentId === studentId && !n.isRead
		);
		const scored = applyRecencyScoring(notifications);
		const sorted = sortByPriority(scored);
		return sorted.slice(0, limit);
	} catch (error) {
		logger.error('repository', `Priority: ${error.message}`);
		throw error;
	}
}

export async function saveNotifications(notifications) {
	try {
		logger.debug('repository', `Saving ${notifications.length}`);
		for (const notif of notifications) {
			const id = generateId();
			notificationsStore.push({
				id,
				studentId: notif.studentId,
				message: notif.message,
				type: notif.type,
				priority: notif.priority,
				isRead: notif.isRead,
				timestamp: notif.timestamp
			});
		}
		logger.info('repository', `Saved ${notifications.length}`);
	} catch (error) {
		logger.error('repository', `Save: ${error.message}`);
		throw error;
	}
}

export async function updateNotificationStatus(notificationId, isRead) {
	try {
		logger.debug('repository', `Updating ${notificationId}`);
		const notif = notificationsStore.find(n => n.id === notificationId);
		if (notif) {
			notif.isRead = isRead;
			logger.info('repository', `Status updated`);
		}
	} catch (error) {
		logger.error('repository', `Update: ${error.message}`);
		throw error;
	}
}
