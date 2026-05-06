import axios from "axios";
import { createLogger } from "../../loggingMiddleware/log.js";
const BASE_URL = "http://20.207.122.201/evaluation-service";
const logger = createLogger({ stack: 'backend' });
function createApiInstance() {
	return axios.create({
		baseURL: BASE_URL,
		headers: {
			Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
		},
		timeout: 5000
	});
}
export async function getDepots() {
	try {
		const api = createApiInstance();
		logger.debug('repository', 'Fetching depots from API');

		const response = await api.get("/depots");
		logger.debug('repository', `Retrieved ${response.data.depots.length} depots`);

		return response.data.depots;
	} catch (error) {
		logger.error('repository', `Depots API failed: ${error.message}`);

		throw new Error(`Failed to fetch depots: ${error.message}`);
	}
}

export async function getVehicles() {
	try {
		const api = createApiInstance();
		logger.debug('repository', 'Fetching vehicles from API');

		const response = await api.get("/vehicles");
		logger.debug('repository', `Retrieved ${response.data.vehicles.length} vehicles`);

		return response.data.vehicles;
	} catch (error) {
		logger.error('repository', `Vehicles API failed: ${error.message}`);

		throw new Error(`Failed to fetch vehicles: ${error.message}`);
	}
}