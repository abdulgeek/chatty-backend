import { ObjectId } from "mongodb";
import { Request, Response } from "express";
import { joiValidation } from "@global/decorators/joi-validation";
import { signupSchema } from "@auth/schemas/signup";
import { authService } from '../../../shared/services/db/auth.service';
import { IAuthDocument, ISignUpData } from "@auth/interfaces/auth.interface";
import { BadRequestError } from "@global/helpers/error-handler";
import { Helpers } from "@global/helpers/helper";
import { uploads } from "@global/helpers/cloudinary-upload";
import { UploadApiResponse } from "cloudinary";
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from "@service/redis/user.cache";
import { IUserDocument } from "@user/interfaces/user.interface";
import { omit } from "lodash";

const userCache: UserCache = new UserCache()

export class SignUp {

  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const userExists: IAuthDocument | null = await authService.getUserByUsernameOrEmail(email, password)
    if (userExists) {
      throw new BadRequestError("User already exists")
    }
    const authObjectId: ObjectId = new ObjectId()
    const userObjectId: ObjectId = new ObjectId()
    const uId = `${Helpers.generateRandomIntegers(12)}`
    const authData: IAuthDocument = SignUp.prototype.SignUpData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    })
    const result: UploadApiResponse = await uploads(avatarImage, `${userObjectId}`, true, true) as UploadApiResponse;
    if (!result.public_id) {
      throw new BadRequestError("Image upload failed")
    }

    // Add User to Redis
    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
    userDataForCache.profilePicture = `https://res.cloudinary.com/dnq3eqkpk/image/upload/v${result.version}/${userObjectId}`;
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    // Add to database
    omit(userDataForCache, [])

    res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully!!!' })
  }

  private SignUpData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, password, avatarColor } = data;
    return {
      _id: _id,
      uId: `${Helpers.generateRandomIntegers(12)}`,
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email,
      password,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;
  }
}
