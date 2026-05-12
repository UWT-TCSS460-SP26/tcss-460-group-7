const MISSING_TOKEN_MESSAGE = 'The bearer token is missing.';
const EXPIRED_TOKEN_MESSAGE = 'The bearer token has expired.';
const INVALID_TOKEN_MESSAGE = 'The bearer token is invalid.';

type JwtLikeError = {
  code?: string;
  inner?: {
    message?: string;
    name?: string;
  };
  message?: string;
};

export const authErrorMessages = {
  missing: MISSING_TOKEN_MESSAGE,
  expired: EXPIRED_TOKEN_MESSAGE,
  invalid: INVALID_TOKEN_MESSAGE,
} as const;

export const getAuthErrorMessage = (
  authHeader: string | undefined,
  err?: JwtLikeError | null
): string => {
  if (!authHeader?.trim()) {
    return MISSING_TOKEN_MESSAGE;
  }

  if (err?.code === 'credentials_required') {
    return MISSING_TOKEN_MESSAGE;
  }

  if (
    err?.inner?.name === 'TokenExpiredError' ||
    err?.inner?.message === 'jwt expired' ||
    err?.message === 'jwt expired'
  ) {
    return EXPIRED_TOKEN_MESSAGE;
  }

  return INVALID_TOKEN_MESSAGE;
};
