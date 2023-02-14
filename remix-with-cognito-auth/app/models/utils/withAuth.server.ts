import { DataFunctionArgs, redirect } from "@remix-run/node";
import {
  getUserSessionFromCookie,
  sessionStorage,
  refreshTokenStorage,
  accessTokenStorage,
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
} from "~/utils/cookies/auth-session-cookies.server";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { JwtExpiredError } from "aws-jwt-verify/error";
import {
  USERPOOL_ID,
  WEB_CLIENT_ID,
} from "~/utils/env";
import { refreshAccessToken } from "~/models/auth/refresh-access-token";

// This verifier will trust our user pool
export const accessTokenVerifier = CognitoJwtVerifier.create([
  {
    userPoolId: USERPOOL_ID,
    clientId: WEB_CLIENT_ID, // clientId is mandatory at verifier level now, to disambiguate between User Pools
    tokenUse: "access",
  },
]);

const withAuth = async (
  context: DataFunctionArgs,
  redirectLoc: string = "/login"
) => {
  const userSession = await getUserSessionFromCookie(context.request);

  const email = userSession.get("email");
  const userId = userSession.get("userId");
  const user = {
    email,
    userId,
  }
  const accessTokenCookieSession = await getAccessTokenFromCookie(
    context.request
  );
  const refreshTokenCookieSession = await getRefreshTokenFromCookie(
    context.request
  );
  let accessT = accessTokenCookieSession.get("accessToken") as string;

  if (accessT == null) {
    throw redirect(redirectLoc);
  }

  let headers = new Headers();

  try {
    const verifiedAccessToken = await verifyToken(accessT);
    // this a good place to pass back a user info or a db connection to be used in loaders / actions
    
    return {
      ...context,
      user,
      headers,
    };
  } catch (error) {
    console.log("Error Authenticating access token", error);
    if (error instanceof JwtExpiredError) {
      let refreshT = refreshTokenCookieSession.get("refreshToken") as string;

      if (refreshT == null) {
        throw redirect("/login");
      }
      try {
        const newTokens = await refreshAccessToken(refreshT);
        accessTokenCookieSession.set(
          "accessToken",
          newTokens.response?.accessToken
        );
        refreshTokenCookieSession.set(
          "refreshToken",
          newTokens.response?.refreshToken
        );
          
        headers.append(
          "Set-Cookie",
          await sessionStorage.commitSession(userSession)
        );
        headers.append(
          "Set-Cookie",
          await accessTokenStorage.commitSession(accessTokenCookieSession)
        );
        headers.append(
          "Set-Cookie",
          await refreshTokenStorage.commitSession(refreshTokenCookieSession)
        );
        // redirect to the same URL if the request was a GET (loader) - otherwise, return the headers - not 100% sure this is the best way to do this
        if (context.request.method === "GET") {
          throw redirect(context.request.url, { headers });
        }
        const email = userSession.get("email");
        const userId = userSession.get("userId");
        const user = {
          email,
          userId,
        }
        return {
          ...context,
          user,
          headers,
        };
      } catch (error) {
        console.log("Error Authenticating refresh token", error);
        throw redirect("/login");
      }
    } else {
      throw redirect("/login");
    }
  }
};

/**
 * Verifies user has a valid access token for user pool
 */
export const verifyToken = async (token: string) => {
  let accessTokenPayload;
  try {
    accessTokenPayload = await accessTokenVerifier.verify(
      token // token must be signed by either of the User Pools
    );
    return accessTokenPayload;
  } catch (error) {
    throw error;
  }
};

export default withAuth;
