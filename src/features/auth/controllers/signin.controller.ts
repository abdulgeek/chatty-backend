import { Request, Response } from 'express';
import { config } from '@root/config';
import JWT from 'jsonwebtoken';
import { joiValidation } from '@global/decorators/joi-validation';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@service/db/auth.service';
import { loginSchema } from '@auth/schemas/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { BadRequestError } from '@global/helpers/error-handler';
import { userService } from '@service/db/user.service';
import { IResetPasswordParams, IUserDocument } from '@user/interfaces/user.interface';
import { emailQueue } from '@service/queues/email.queue';
import moment from 'moment';
import { resetPasswordTemplate } from '@service/emails/reset-password/reset-password-template';
import requestIp from 'request-ip';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const user: IUserDocument | null = await userService.getUserByAuthId(`${existingUser._id}`);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );

    let ipaddress: string | undefined;
    try {
      ipaddress = requestIp.getClientIp(req) ?? undefined;
    } catch (error) {
      console.error("Failed to retrieve IP address:", error);
    }

    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email ?? '',
      ipaddress: ipaddress ?? 'Unavailable',
      date: moment().format('DD/MM/YYYY HH:mm')
    };

    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    
    emailQueue.addEmailJob('forgetPasswordEmail', {
      template,
      receiverEmail: 'katherine.douglas@ethereal.email',
      subject: 'Password Reset'
    });
    req.session = { jwt: userJwt };
    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt
    } as IUserDocument;
    res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: userDocument, token: userJwt });
  }
}
