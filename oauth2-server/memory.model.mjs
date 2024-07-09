const clients = [
  {
    id: "clientId1",
    clientSecret: "client@secret",
    redirectUris: ["http://localhost:8000"],
    // only those allowed
    grants: [
      "password",
      "authorization_code",
      "client_credentials",
      "refresh_token",
    ],
  },
];
const users = [{ id: "123", username: "mira", password: "12345" }];

const tokens = [];
const codes = [];

export const MemoryModel = {
  //#region all
  getAccessToken: async (accessToken) => {
    return tokens.find((token) => token.accessToken === accessToken);
  },
  getClient: async (clientId, clientSecret) => {
    if (clientSecret === null) {
      const client = clients.find((client) => client.id === clientId);
      return client;
    }

    const client = clients.find(
      (client) => client.id === clientId && client.clientSecret === clientSecret
    );
    return client;
  },
  getUser: async (username, password) => {
    return users.find(
      (user) => user.username === username && user.password === password
    );
  },
  saveToken: async (token, client, user) => {
    const tokenData = {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      client: {
        id: client.id,
        grants: client.grants,
      },
      user: {
        id: user.id,
      },
    };

    tokens.push(tokenData);

    return tokenData;
  },

  //#endregion

  //#region authorization code
  saveAuthorizationCode: async (code, client, user) => {
    codes.push({
      ...code,
      client: {
        id: client.id,
        grants: client.grants,
      },
      user: {
        id: user.id,
      },
    });
    return code;
  },

  getAuthorizationCode: async (authorizationCode) => {
    const a = codes.find(
      (code) => code.authorizationCode === authorizationCode
    );
    return a;
  },
  revokeAuthorizationCode: async (code) => {
    const index = codes.findIndex(
      (c) => c.authorizationCode === code.authorizationCode
    );
    codes.splice(index, 1);
    return true;
  },

  //#endregion

  //#region client credentials
  getUserFromClient: async (client) => {
    console.log(client)
    // TODO: find related user
    return users[0];
  },

  //#endregion

  //#region refresh token
  getRefreshToken: async (refreshToken) => {
    return tokens.find((token) => token.refreshToken === refreshToken);
  },

  revokeToken: async (token) => {
    const index = tokens.findIndex((t) => t.accessToken === token.accessToken);
    tokens.splice(index, 1);
    return true;
  },

  //#endregion
};
