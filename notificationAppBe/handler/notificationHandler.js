import { createLogger } from "../../loggingMiddleware/log.js";
import { fetchNotifications, saveNotifications, fetchPriorityNotifications, updateNotificationStatus } from "../repository/notificationRepository.js";
import { calculatePriority, validateNotificationPayload } from "../service/notificationService.js";

const logger = createLogger({ stack: 'backend' });

export async function getNotifications(req, res) {
	try {
		const studentId = req.query.studentId;
		logger.info('handler', `Fetching ${studentId}`);

		if (!studentId) {
			return res.status(400).json({
				success: false,
				title: 'Missing Field',
				message: 'studentId is required'
			});
		}

		const notifications = await fetchNotifications(studentId);
		logger.debug('handler', `Retrieved ${notifications.length}`);

		res.status(200).json({
			success: true,
			title: 'Inbox',
			message: 'Notifications loaded',
			count: notifications.length,
			notifications
		});
	} catch (error) {
		logger.error('handler', `Fetch failed`);
		res.status(500).json({
			success: false,
			title: 'Request Failed',
			message: error.message
		});
	}
}

export async function getPriorityNotifications(req, res) {
	try {
		const studentId = req.query.studentId;
		const limit = parseInt(req.query.limit) || 10;
		logger.info('handler', `Priority ${studentId}`);

		if (!studentId) {
			return res.status(400).json({
				success: false,
				title: 'Missing Field',
				message: 'studentId is required'
			});
		}

		const notifications = await fetchPriorityNotifications(studentId, limit);
		logger.debug('handler', `Priority: ${notifications.length}`);

		res.status(200).json({
			success: true,
			title: 'Priority Inbox',
			message: 'Priority notifications loaded',
			count: notifications.length,
			notifications
		});
	} catch (error) {
		logger.error('handler', `Priority failed`);
		res.status(500).json({
			success: false,
			title: 'Request Failed',
			message: error.message
		});
	}
}

export async function sendNotifications(req, res) {
	try {
		const { studentIds, message, type } = req.body;
		logger.info('handler', `Sending to ${studentIds.length}`);

		const validation = validateNotificationPayload(req.body);
		if (!validation.valid) {
			logger.error('handler', `Validate failed`);
			return res.status(400).json({
				success: false,
				title: 'Invalid Input',
				message: validation.error
			});
		}

		const notifications = studentIds.map(sid => ({
			studentId: sid,
			message,
			type,
			priority: calculatePriority(type),
			timestamp: new Date(),
			isRead: false
		}));

		await saveNotifications(notifications);
		logger.info('handler', `Saved ${notifications.length}`);

		res.status(200).json({
			success: true,
			title: 'Sent',
			message: 'Notifications sent',
			count: notifications.length
		});
	} catch (error) {
		logger.error('handler', `Send failed`);
		res.status(500).json({
			success: false,
			title: 'Send Failed',
			message: error.message
		});
	}
}

export async function markAsRead(req, res) {
	try {
		const notificationId = req.params.id;
		logger.info('handler', `Marking read`);

		await updateNotificationStatus(notificationId, true);
		logger.debug('handler', `Marked read`);

		res.status(200).json({
			success: true,
			title: 'Updated',
			message: 'Notification marked as read'
		});
	} catch (error) {
		logger.error('handler', `Mark failed`);
		res.status(500).json({
			success: false,
			title: 'Update Failed',
			message: error.message
		});
	}
}
