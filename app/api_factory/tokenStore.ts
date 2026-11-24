/**
 * The admin's access token, held in memory only: never in localStorage or a cookie scripts can
 * read. A reload starts empty and gets a fresh one from /api/session/refresh, which uses the
 * httpOnly refresh cookie.
 */
let accessToken = '';

export const getAccessToken = (): string => accessToken;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = '';
};
