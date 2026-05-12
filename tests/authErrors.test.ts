import { authErrorMessages, getAuthErrorMessage } from '../src/middleware/authErrors';

describe('getAuthErrorMessage', () => {
  it('returns the missing-token message when the authorization header is absent', () => {
    expect(getAuthErrorMessage(undefined)).toBe(authErrorMessages.missing);
  });

  it('returns the missing-token message when express-jwt reports missing credentials', () => {
    expect(getAuthErrorMessage('Bearer token', { code: 'credentials_required' })).toBe(
      authErrorMessages.missing
    );
  });

  it('returns the expired-token message when the jwt is expired', () => {
    expect(
      getAuthErrorMessage('Bearer token', {
        code: 'invalid_token',
        inner: { name: 'TokenExpiredError', message: 'jwt expired' },
      })
    ).toBe(authErrorMessages.expired);
  });

  it('returns the invalid-token message for other token validation failures', () => {
    expect(
      getAuthErrorMessage('Bearer token', {
        code: 'invalid_token',
        inner: { name: 'JsonWebTokenError', message: 'jwt malformed' },
      })
    ).toBe(authErrorMessages.invalid);
  });
});
