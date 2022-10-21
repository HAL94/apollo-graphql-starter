import { User } from '../../entities';
import { sign } from 'jsonwebtoken';
import { Response } from 'express';
import { verify } from 'jsonwebtoken';
import { Request } from 'express';

export const AUTH_NAMES = {
  ACCESS_TOKEN_KEY: 'jid',
  REFRESH_TOKEN_KEY: 'f_tid',
  USER_INFO_KEY: 'i_u',
};

export const createAccessToken = (user: User) => {
  return sign(
    {
      userId: user.id,
      expires: new Date(
        Date.now() + Number(process.env.ACCESS_TOKEN_EXPIRES_IN_MILLI),
      ),
    },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    },
  );
};

export const createRefreshToken = (user: User) => {
  return sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: '7d',
    },
  );
};

export const revokeRefreshToken = async (payload: any) => {
  if (payload) {
    const userId = payload.userId;
    const user = await User.findOneBy({ id: userId });
    if (user) {
      user.tokenVersion += 1;
      await user.save();
    }
  }
};

export const clearSession = (res: Response) => {
  res.clearCookie(AUTH_NAMES.ACCESS_TOKEN_KEY);
  res.clearCookie(AUTH_NAMES.USER_INFO_KEY);
  res.clearCookie(AUTH_NAMES.REFRESH_TOKEN_KEY);
};

export const sendCookie = (
  res: Response,
  key: string,
  token: string,
  opts: any = { httpOnly: true, path: '/' },
) => {
  res.cookie(key, token, opts);
};

export const sendAuthCookies = (
  res: Response,
  accessToken: string,
  atExpiration: Date,
  refreshToken: string,
  rtExpiration: Date,
  userId: string,
) => {
  sendCookie(res, AUTH_NAMES.ACCESS_TOKEN_KEY, accessToken, {
    httpOnly: true,    
    path: '/',
    expires: atExpiration,
    sameSite: 'none',
    secure: true,    
  });
  sendCookie(res, AUTH_NAMES.REFRESH_TOKEN_KEY, refreshToken, {
    httpOnly: true,    
    expires: rtExpiration,
    sameSite: 'none',
    path: '/',
    secure: true,    
  });
  sendCookie(
    res,
    AUTH_NAMES.USER_INFO_KEY,
    userId + '.' + process.env.RANDOM_USER_INFO_KEY,
    {
      httpOnly: false,
      path: '/',
      expires: atExpiration,
      sameSite: 'none',
      secure: true,      
    },
  );
};

export const decryptToken = (
  req: Request,
  tokenKey: string,
  secret: string,
): any => {
  try {
    console.log('decrypting', tokenKey, req.cookies);
    const token = req.cookies[tokenKey];
    if (!token) {
      return;
    }

    return verify(token, secret);
  } catch (error) {
    throw error;
  }
};
