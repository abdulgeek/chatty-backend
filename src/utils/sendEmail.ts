/** Importing Dependencies */
import { systemLogs } from "./Logger";
import { transporter } from "./emailTransport";

/**
 * @description - Function to Send Email
 **/
async function sendEmail(options: any) {

    try {
        const info = await transporter.sendMail(options);
        console.log("Email sent:", info.response);
        systemLogs.info("Email sent:", info.response)
    } catch (error) {
        systemLogs.error("Error sending email: ", error);
        console.error("Error sending email:", error);
    }
}

export default sendEmail;
