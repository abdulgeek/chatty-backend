/** Importing Libraries */
import morgan from "morgan";
import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, prettyPrint } = format;

/**
 * @description - Creating a daily rotating file transport for Winston
 */
const fileRotateTransport = new transports.DailyRotateFile({
    filename: "logs/combined-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d",
});

/**
 * @description - Creating a Winston logger instance
 */
export const systemLogs = createLogger({
    level: "http",
    format: combine(
        timestamp({
            format: "YYYY-MM-DD hh:mm:ss.SSS A",
        }),
        prettyPrint()
    ),
    transports: [
        fileRotateTransport,
        new transports.File({
            level: "error",
            filename: "logs/error.log",
        }),
    ],
    // Log unhandled exceptions to a separate file
    exceptionHandlers: [
        new transports.File({ filename: "logs/exception.log" }),
    ],
    // Log unhandled promise rejections to a separate file
    rejectionHandlers: [
        new transports.File({ filename: "logs/rejections.log" }),
    ],
});

interface Stream {
    write: (message: string) => void;
}

interface LogData {
    method: string;
    url: string;
    status: number;
    content_length: string;
    response_time: number;
}

/**
 * @description - Morgan middleware function for logging incoming HTTP requests
 */
export const morganMiddleware = morgan(
    function (tokens: morgan.TokenIndexer, req, res) {
        const logData: LogData = {
            method: tokens.method(req, res) || '',
            url: tokens.url(req, res) || '',
            status: Number.parseFloat(tokens.status(req, res) || '0'),
            content_length: tokens.res(req, res, "content-length") || '',
            response_time: Number.parseFloat(tokens["response-time"](req, res) || '0'),
        };
        return JSON.stringify(logData);
    },
    {
        stream: {
            write: (message: string) => {
                const data: LogData = JSON.parse(message);
                systemLogs.http(`incoming-request`, data);
            },
        } as Stream,
    }
);
