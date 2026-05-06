import { createLogger } from "../../loggingMiddleware/log.js";
import { getDepots, getVehicles } from "../repository/schedulerRepository.js";
import { optimizeSchedule } from "../service/schedulerService.js";
const logger = createLogger({ stack: 'backend' });
export async function getSchedule(req, res) {
	try {
		logger.info('handler', 'Fetching depots and vehicles');
		const [depots, vehicles] = await Promise.all([
			getDepots(),
			getVehicles()
		]);
		logger.debug('handler', `Retrieved ${depots.length}D ${vehicles.length}V`);
		const results = depots.map(depot => {
			const optimized = optimizeSchedule(vehicles, depot.MechanicHours);
			return {
				depotId: depot.ID,
				mechanicHours: depot.MechanicHours,
				maxImpact: optimized.maxImpact,
				selectedTasks: optimized.selectedTasks
			};
		});
		logger.info('handler', `Optimized ${results.length} depots`);
		res.status(200).json({
			totalDepots: results.length,
			results
		});
	} catch (error) {
		logger.error('handler', `Route error: ${error.message}`);

		res.status(500).json({
			message: error.message
		});
	}
}