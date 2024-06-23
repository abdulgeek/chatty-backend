import { IAuthDocument } from "@auth/interfaces/auth.interface";
import { model, Model, Schema } from 'mongoose';
import { hash, compare } from 'bcryptjs';

const authSchema = new Schema<IAuthDocument>({
  username: { type: String },
  uId: { type: String },
  email: { type: String },
  password: { type: String },
  avatarColor: { type: String },
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: {
    transform(_doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
  const hashPassword: string = await hash(this.password as string, 10);
  this.password = hashPassword;
  next();
});

authSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const hashedPassword: string = (this as unknown as IAuthDocument).password as string;
  return await compare(password, hashedPassword);
};

authSchema.methods.hashPassword = async function (password: string): Promise<string> {
  return await hash(password, 10);
};

const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('Auth', authSchema, 'Auth');

export default AuthModel;
