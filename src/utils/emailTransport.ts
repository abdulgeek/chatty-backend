/** Importing Libraries */
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import { EMAIL, PASSWORD } from "@root/config/env";
dotenv.config();

/**
 * @description - Function to Send Email
 **/
export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: String(EMAIL),
        pass: String(PASSWORD),
    },
});

