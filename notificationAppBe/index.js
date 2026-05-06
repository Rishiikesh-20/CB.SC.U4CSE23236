import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import notificationRoutes from "./route/notificationRoute.js";
import { createLogger } from "../loggingMiddleware/log.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env"), override: false });

const logger = createLogger({ stack: 'backend' });
const app = express();

app.use(express.json());
app.use("/notifications", notificationRoutes);

const PORT = 3001;

app.use((err, req, res, next) => {
	console.error('Unhandled server error:', err.message);
	res.status(500).json({
		message: 'Internal Server Error'
	});
});

app.listen(PORT, () => {
	console.log(`✓ Notifications running on port ${PORT}`);
	logger.info('controller', `Notifications running ${PORT}`);
});
