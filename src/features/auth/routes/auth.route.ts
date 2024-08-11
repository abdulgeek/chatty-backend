import { CurrentUser } from '@auth/controllers/current.controller';
import { Password } from '@auth/controllers/password.controller';
import { SignIn } from '@auth/controllers/signin.controller';
import { SignOut } from '@auth/controllers/signout.controller';
import { SignUp } from '@auth/controllers/signup.controller';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', SignUp.prototype.create)
    this.router.post('/signin', SignIn.prototype.read)
    this.router.get('/signout', SignOut.prototype.update)
    this.router.get('/forgot-password', Password.prototype.update)
    this.router.get('/current-user', authMiddleware.verifyUser, authMiddleware.checkAuthentication, CurrentUser.prototype.read);
    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
