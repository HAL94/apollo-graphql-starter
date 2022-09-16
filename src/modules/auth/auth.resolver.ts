// import { Context } from 'apollo-server-core';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { Context } from '../../interfaces/Context';
import { User } from '../user/user.entity';
import { CredentialsInput } from './dto/input/credentials.input';
import bcrypt, { hash } from 'bcrypt';
import {
  AUTH_NAMES,
  clearSession,
  createAccessToken,
  createRefreshToken,
  decryptToken,
  sendAuthCookies,
} from './utils';

import { LoginResponse } from './responses/LoginResponse';
import { RegisterResponse } from './responses/RegisterResponse';
import { RefreshResponse } from './responses/RefreshResponse';
import { LogoutResponse } from './responses/LogoutResponse';

@Resolver()
export default class AuthResolver {
  @Mutation(() => RegisterResponse)
  async register(
    @Arg('RegisterInput', () => CredentialsInput) regInput: CredentialsInput,
  ): Promise<RegisterResponse> {
    const hashPassword = await hash(regInput.password, 10);
    try {
      await User.insert({
        username: regInput.username,
        password: hashPassword,
      });
    } catch (error) {
      // console.log('Reg Error', error);
      return {
        message: 'Unable to register',
        success: false,
      };
    }

    return {
      message: 'Successfully registred user',
      success: true,
    };
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('LoginInput', () => CredentialsInput) loginInput: CredentialsInput,
      @Ctx() context: Context,
  ): Promise<LoginResponse | Error | undefined> {
    try {
      const payload = {
        username: loginInput.username,
        password: loginInput.password,
      };
      const user = await User.findOneBy({
        username: payload.username,
      });
      if (!user) {
        throw new Error('Not able to log in');
      }

      const isMatch = await bcrypt.compare(payload.password, user.password!);

      if (!isMatch) {
        throw new Error('Invalid Credentials');
      }

      const { res } = context;

      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);

      const atExpiration = new Date(
        Date.now() + Number(process.env.ACCESS_TOKEN_EXPIRES_IN_MILLI!),
      );
      const rtExpiration = new Date(
        Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRES_IN_MILLI!),
      );

      sendAuthCookies(
        res,
        accessToken,
        atExpiration,
        refreshToken,
        rtExpiration,
        user.id!,
      );

      const loginResponse = new LoginResponse();
      loginResponse.message = 'Successfully logged in';
      loginResponse.success = true;

      return loginResponse;
    } catch (error) {
      console.log('error @ login', error);
    }
  }

  @Mutation(() => RefreshResponse)
  async refreshToken(@Ctx() context: Context) {
    const response = new RefreshResponse();
    response.message = 'Unable to refresh your tokens, you might need to login in again!';
    response.success = false;

    const { req, res } = context;
    const rtKey = AUTH_NAMES.REFRESH_TOKEN_KEY;
    let payload = null;

    try {
      payload = decryptToken(req, rtKey, process.env.REFRESH_TOKEN_SECRET!);
    } catch (error) {
      throw error;
    }

    if (typeof payload === 'boolean') {
      return response;
    }

    const user = await User.findOneBy({ id: payload.userId });

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return response;
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    const atExpiration = new Date(
      Date.now() + Number(process.env.ACCESS_TOKEN_EXPIRES_IN_MILLI!),
    );
    const rtExpiration = new Date(
      Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRES_IN_MILLI!),
    );

    sendAuthCookies(
      res,
      accessToken,
      atExpiration,
      refreshToken,
      rtExpiration,
      user.id!,
    );

    response.success = true;
    response.message = 'Successfully regenerated tokens';

    return response;
  }

  @Query(() => String)
  me(@Ctx() context: Context) {
    try {
      const { req } = context;
      let payload = null;
      try {
        payload = decryptToken(
          req,
          AUTH_NAMES.ACCESS_TOKEN_KEY,
          process.env.ACCESS_TOKEN_SECRET!,
        );
      } catch (error) {
        return '';
      }

      if (typeof payload === 'boolean') {
        return '';
      }

      return `${payload.userId}`;
    } catch (error) {
      console.log('Error at me', error);
      throw error;
    }
  }

  @Query(() => LogoutResponse)
  async logout(@Ctx() context: Context) {
    try {
      const response = new LogoutResponse();
      response.message = 'Successufully Logged Out';
      response.success = true;

      const { res } = context;
      clearSession(res);

      return response;
    } catch (error) {
      console.log('error at logout', error);
      throw error;
    }
  }
}
