import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { SESSION_SECRET, NODE_ENV } from "~/utils/env";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    secure: NODE_ENV === "production",
  },
});

export const accessTokenStorage = createCookieSessionStorage({
  cookie: {
    name: "__access",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    secure: NODE_ENV === "production",
  },
});

export const refreshTokenStorage = createCookieSessionStorage({
  cookie: {
    name: "__refresh",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    secure: NODE_ENV === "production",
  },
});

// helper to get user session from cookie
export async function getUserSessionFromCookie(request: Request) {
  const cookieHeaders = request.headers.get("Cookie");
  return sessionStorage.getSession(cookieHeaders);
}
// helper to get access token from cookie
export async function getAccessTokenFromCookie(request: Request) {
  const cookieHeaders = request.headers.get("Cookie");
  return accessTokenStorage.getSession(cookieHeaders);
}
// helper to get refresh token from cookie
export async function getRefreshTokenFromCookie(request: Request) {
  const cookieHeaders = request.headers.get("Cookie");
  return refreshTokenStorage.getSession(cookieHeaders);
}

/**
 * Create user session, access token and refresh token cookies
 * @param request
 * @param userInfo
 * @param redirectTo
 * @returns headers to set the cookies + redirect to the dashboard
 */
export async function createUserSession({
  request,
  userInfo,
  redirectTo,
}: {
  request: Request;
  userInfo: {
    userName: string;
    accessToken: string;
    refreshToken: string;
    email: string;
  };
  redirectTo: string;
}) {
  // get all auth session cookies
  const session = await getUserSessionFromCookie(request);
  const accessTokenCookieSession = await getAccessTokenFromCookie(request);
  const refreshTokenCookieSession = await getRefreshTokenFromCookie(request);

  // set user info into session cookie
  session.set("userName", userInfo.userName);
  session.set("email", userInfo.email);
  // set access token into access token cookie
  accessTokenCookieSession.set("accessToken", userInfo.accessToken);
  // set refresh token into refresh token cookie
  refreshTokenCookieSession.set("refreshToken", userInfo.refreshToken);
  let headers = new Headers();

  headers.append(
    "Set-Cookie",
    await refreshTokenStorage.commitSession(refreshTokenCookieSession)
  );
  headers.append(
    "Set-Cookie",
    await accessTokenStorage.commitSession(accessTokenCookieSession)
  );
  headers.append("Set-Cookie", await sessionStorage.commitSession(session));
  // return headers to client - this will set the updated cookies
  return redirect(redirectTo || "/dashboard", {
    headers: headers,
  });
}

/**
 * Destroy the session, access, refresh tokens and redirect to the login page
 */
export async function logoutSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const accessT = await accessTokenStorage.getSession(
    request.headers.get("Cookie")
  );
  const refreshT = await refreshTokenStorage.getSession(
    request.headers.get("Cookie")
  );

  let headers = new Headers();

  headers.append("Set-Cookie", await sessionStorage.destroySession(session));
  headers.append(
    "Set-Cookie",
    await accessTokenStorage.destroySession(accessT)
  );
  headers.append(
    "Set-Cookie",
    await refreshTokenStorage.destroySession(refreshT)
  );

  return redirect("/login", {
    headers: headers,
  });
}
