import axios from "axios"
const LOG_ENDPOINT = process.env.LOG_API_URL || 'http://20.207.122.201/evaluation-service/logs';
const STACKS = new Set(['backend', 'frontend']);
const LEVELS = new Set(['debug', 'info', 'warn', 'error', 'fatal']);

function isLowerCase(value) {
	return typeof value === 'string' && value.length > 0   && value === value.toLowerCase();
}

export function validateLogInput(stack,level,packageName,message) {
	if (!STACKS.has(stack)) {
		throw new Error(`Invalid stack value: ${stack}`);
	}
	if (!LEVELS.has(level)) {
		throw new Error(`Invalid level value: ${level}`);
	}
	if (!isLowerCase(packageName)) {
		throw new Error('Package must be a non-empty lowercase string');
	}
	if (typeof message !== 'string' || message.trim().length === 0) {
		throw new Error('Message must be a non-empty string');
	}
}

export async function postLog(payload, endpoint = LOG_ENDPOINT) {
    try{
		const response = await axios.post(endpoint, payload);
		return response.data;
	}catch (error) {
		if (error.response) {
			throw new Error(
				`Log API request failed: ${error.response.status} ${error.response.statusText}`
			);
		}
		if (error.request) {
			throw new Error("No response received from server");
		}
		throw new Error(error.message);
	}
}

export async function Log(stack, level, packageName, message) {
	validateLogInput(stack, level, packageName, message);

	const payload = {
		stack,
		level,
		package: packageName,
		message,
	};

	try {
		return await postLog(payload);
	} catch (error) {
		console.error('Logging middleware failed:', error.message);
		throw error;
	}
}

export function createLogger(defaults = {}) {
	return {
		log: (stack, level, packageName, message) => Log(stack, level, packageName, message),
		debug: (packageName, message) => Log(defaults.stack || 'backend', 'debug', packageName, message),
		info: (packageName, message) => Log(defaults.stack || 'backend', 'info', packageName, message),
		warn: (packageName, message) => Log(defaults.stack || 'backend', 'warn', packageName, message),
		error: (packageName, message) => Log(defaults.stack || 'backend', 'error', packageName, message),
		fatal: (packageName, message) => Log(defaults.stack || 'backend', 'fatal', packageName, message),
	};
}
