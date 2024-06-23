import { IAuthDocument } from "@auth/interfaces/auth.interface";
import AuthModel from "@auth/models/auth.model";
import { Helpers } from "@global/helpers/helper";

class AuthService {
  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument | null> {
    const user = await AuthModel.findOne({ $or: [{ username }, { email: Helpers.lowerCase(email) }] }).exec();
    return user;
  }

}

export const authService: AuthService = new AuthService();
