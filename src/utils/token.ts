/** Importing Libraries */
import jwt from "jsonwebtoken";

/** Importing Dependencies **/
import Api, { Message } from "./helper";
import * as dotenv from 'dotenv';
import { ACCESS_TOKEN_EXPIRE, JWT_ACCESS_SECRET_KEY, JWT_REFRESH_SECRET_KEY, NODE_ENV, REFRESH_TOKEN_EXPIRE } from "@root/config/env";
dotenv.config();

/**
 * @description - Function for Generating Token with Mongo User info and Activation Code and Secret Key
**/
export const generateToken = (req: any, res: any, user: any) => {
    try {
        const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
        const payload: Record<string, any> = {
            user,
            activationCode
        };
        const token = jwt.sign(payload, String(JWT_ACCESS_SECRET_KEY), { expiresIn: "5m" });
        return { token, activationCode };
    } catch (error) {
        return Api.serverError(req, res, Message.ServerError, 'Something went wrong!!!')
    }
};

// prase environment variables to integrates with fallback values
const accessTokenExpire = parseInt(ACCESS_TOKEN_EXPIRE || '300', 10)
const refreshTokenExpire = parseInt(REFRESH_TOKEN_EXPIRE || '300', 10)

// option for cookies
export const accessTokenOptions: any = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 1000,
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    domain: 'localhost',
    secure: NODE_ENV === 'production'
};

export const refreshTokenOptions: any = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    domain: 'localhost',
    secure: NODE_ENV === 'production'
};


/**
 * @description - Send Access Token
 */
export const generateAccessToken = (req: any, res: any, user: any) => {
    const accessToken = user.signAccessToken();
    const refreshToken = user.signRefreshToken();



    // only set secure to true in production
    if (NODE_ENV === 'production') {
        accessTokenOptions.secure = true
        refreshTokenOptions.secure = true
    }

    res.cookie("access_token", accessToken, accessTokenOptions)
    res.cookie("refresh_token", refreshToken, refreshTokenOptions)
    return Api.ok(res, { user, accessToken }, "Login successful")
}


/**
 * @description - Function for Generating Refresh Token with Mongo User ID and Secret Key
 **/
export const generateRefreshToken = (req: any, res: any, user: any) => {
    try {
        const payload: Record<string, any> = {
            _id: user?._id,
        };
        return jwt.sign(payload, String(JWT_REFRESH_SECRET_KEY), { expiresIn: "30d" });
    } catch (error) {
        return Api.serverError(req, res, Message.ServerError, "Something went wrong!!!")
    }
};
