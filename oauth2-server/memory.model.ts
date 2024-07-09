import { OAuth2Model, Client, User, Token, AuthorizationCode } from "./OAuth2Model.ts";

export class MemoryModel implements OAuth2Model {
  clients: Client[] = [
    {
      id: "clientId1",
      clientSecret: "client@secret",
      redirectUris: ["http://localhost:8000"],
      grants: [
        "password",
        "authorization_code",
        "client_credentials",
        "refresh_token",
      ],
    },
  ];
  users: User[] = [{ id: "123", username: "mira", password: "12345" }];
  tokens: Token[] = [];
  codes: AuthorizationCode[] = [];
  constructor() {}

  async getAccessToken(accessToken) {
    return this.tokens.find((token) => token.accessToken === accessToken);
  }

  async getClient(clientId, clientSecret) {
    if (clientSecret === null) {
      return this.clients.find((client) => client.id === clientId);
    }
    return this.clients.find(
      (client) => client.id === clientId && client.clientSecret === clientSecret
    );
  }

  async getUser(username, password) {
    return this.users.find(
      (user) => user.username === username && user.password === password
    );
  }

  async saveToken(token, client, user) {
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

    this.tokens.push(tokenData);
    return tokenData;
  }

  async saveAuthorizationCode(code, client, user) {
    const codeData = {
      ...code,
      client: {
        id: client.id,
        grants: client.grants,
      },
      user: {
        id: user.id,
      },
    };

    this.codes.push(codeData);
    return code;
  }

  async getAuthorizationCode(authorizationCode) {
    return this.codes.find(
      (code) => code.authorizationCode === authorizationCode
    );
  }

  async revokeAuthorizationCode(code) {
    const index = this.codes.findIndex(
      (c) => c.authorizationCode === code.authorizationCode
    );
    this.codes.splice(index, 1);
    return true;
  }

  async getUserFromClient(client) {
    console.log(client);
    // TODO: find related user
    return this.users[0];
  }

  async getRefreshToken(refreshToken) {
    return this.tokens.find((token) => token.refreshToken === refreshToken);
  }

  async revokeToken(token) {
    const index = this.tokens.findIndex(
      (t) => t.accessToken === token.accessToken
    );
    this.tokens.splice(index, 1);
    return true;
  }
}

