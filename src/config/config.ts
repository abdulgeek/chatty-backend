/** Importing Libraries */
import { MONGO_DB, MONGO_PASSWORD, MONGO_USERNAME, SERVER_PORT } from "./env";

const MONGO_OPTIONS = {
	useUnifiedTopology: true,
	useNewUrlParser: true,
	socketTimeoutMS: 30000,
	autoIndex: false,
	retryWrites: false,
};

const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.vioyttd.mongodb.net/${MONGO_DB}?w=majority`;

export const config = {
	mongo: {
		username: MONGO_USERNAME,
		password: MONGO_PASSWORD,
		url: MONGO_URL,
		options: MONGO_OPTIONS,
	},
	server: {
		port: SERVER_PORT,
	},
};
