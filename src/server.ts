/** Importing Libraries */
import express, { Application } from "express";
import * as dotenv from "dotenv";
import http from "http";
import cors from "cors";
import fileUpload from "express-fileupload";
import cookieSession from 'cookie-session';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import * as bodyParser from 'body-parser';

/** Importing Dependencies */
import dbConnect from "./config/connectionDB";
import Logging from "./utils/logging";
import { config } from "./config/config";
import Api, { Message } from "./utils/helper";
import { morganMiddleware, systemLogs } from "./utils/Logger";
import cloudinary from 'cloudinary';
import {  CLOUD_API_KEY, CLOUD_API_SECRET, CLOUD_NAME, NODE_ENV, SECRET_ONE, SECRET_TWO } from "./config/env";
import { Server } from "socket.io";
import SocketServer from "./SocketServer";

dotenv.config();
/** DB configuration */
dbConnect();

// cloudinary configuration
cloudinary.v2.config({
	cloud_name: CLOUD_NAME,
	api_key: CLOUD_API_KEY,
	api_secret: CLOUD_API_SECRET,
})

/** Using Express Server */
const app: Application = express();

/** Middleware */
if (NODE_ENV !== "production") {
	app.use(morgan("dev"));
}
app.use(helmet())
app.use(
	cors({
		origin: (origin, callback) => {
			// Allow any origin, you can also include logic to whitelist origins
			callback(null, true);
		},
		credentials: true, // Allow cookies to be sent with the request from the client
		optionsSuccessStatus: 200,
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
	})
);
app.use(cookieSession({
	name: 'session',
	keys: [SECRET_ONE as string, SECRET_TWO as string],
	maxAge: 24 * 7 * 3600000,
	secure: NODE_ENV !== 'development'
}))
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(
	fileUpload({
		useTempFiles: true,
	})
);
app.use(morganMiddleware);
app.use(mongoSanitize());
app.use(compression());
app.use(express.json());

/**  Only Start Server if Mongoose Connects */
const StartServer = async () => {
	try {
		const server = http.createServer(app);

		// Set up Socket.IO with Redis adapter
		const io = new Server(server, {
			pingTimeout: 60000,
			cors: {
				origin: process.env.CLIENT_ENDPOINT,
			},
		});

		io.on("connection", (socket) => {
			Logging.info("Socket IO 🔌 Connected Successfully ✅ 🔱");
			SocketServer(socket, io);
			socket.on('sendMessage', (msg) => {
				io.emit('receiveMessage', msg);
			})
		});

		/** Log the request */
		app.use((req, res, next) => {
			/** Log the req */
			Logging.info(
				`Incoming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
			);

			res.on("finish", () => {
				/** Log the res */
				Logging.info(
					`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`
				);
			});
			next();
		});

		app.use(express.urlencoded({ extended: true }));
		app.use(express.json());

		/** Rules of our API */
		app.use((req, res, next) => {
			// Set CORS headers
			res.header("Access-Control-Allow-Origin", req.headers.origin);
			res.header(
				"Access-Control-Allow-Headers",
				"Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials"
			);
			res.header("Access-Control-Allow-Credentials", "true");

			// Handle pre-flight request
			if (req.method === "OPTIONS") {
				res.header(
					"Access-Control-Allow-Methods",
					"PUT, POST, PATCH, DELETE, GET"
				);
				return Api.ok(res, {}, '');
			}

			next();
		});


		/** Health Check */
		app.get("/api/ping", (req, res) =>
			Api.ok(res, { hello: "hello word" }, Message.Found)
		);
		app.get('/test-cookies', (req, res) => {
			console.log('Cookies: ', req.cookies);
			res.send('Check the server console.');
		});


		/**  Routes */

		/** Error handling */
		app.use((req, res) => {
			Logging.error(`That route does not exist - ${req.originalUrl}`);
			Api.notFound(req, res, `That route does not exist - ${req.originalUrl}`);
		});

		server
			.listen(config.server.port, () =>
				Logging.info(`Server is running on port ${config.server.port}`))
		systemLogs.info(`Server running in ${NODE_ENV} mode on port ${config.server.port}`);
		Logging.info("Successfully Connected to Socket IO ✅");


		systemLogs.info(
			`Server running in ${NODE_ENV} mode on port ${config.server.port}`
		);
	} catch (error: any) {
		Logging.error("Failed to start the server due to an error: " + error);
		systemLogs.error("Failed to start the server due to an error: " + error);
		process.exit(1);
	}
};

StartServer();
