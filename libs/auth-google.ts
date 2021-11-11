import { OAuth2Client, TokenPayload } from 'google-auth-library';

const OAUTH_GOOGLE_CLIENT_ID = process.env.OAUTH_GOOGLE_CLIENT_ID;
const ISS = 'accounts.google.com';

const client = new OAuth2Client(OAUTH_GOOGLE_CLIENT_ID);

export const verifyIdToken = async (idToken: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: OAUTH_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (validate(payload)) return payload;
  } catch (error) {
    return null;
  }
};

export const validate = ({ iss, aud }: TokenPayload) => {
  return iss.replace('https://', '') === ISS && aud === OAUTH_GOOGLE_CLIENT_ID;
};
