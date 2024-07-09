import { OAuth2Model } from "./OAuth2Model.ts";

export class DenoKVModel implements OAuth2Model {
  constructor(public kv: any) {}
  async initExample() {
    await this.kv.set(
      ["client", "clientId1"],
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
      }
    );
    await this.kv.set(["user", "mira"], {
      username: "mira",
      password: "12345",
    });
    return this;
  }

  async getAccessToken(accessToken) {
    return this.kv.get(["access_token", accessToken]).then((res) => res.value);
  }

  async getClient(clientId, clientSecret) {
    return this.kv.get(["client", clientId]).then((res) => res.value);
  }

  async getUser(username, password) {
    if (!password) return null;
    return this.kv
      .get(["user", username])
      .then((res) => (res.value?.password === password ? res.value : null));
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
    await Promise.all([
      this.kv.set(["access_token", token.accessToken], tokenData),
      this.kv.set(["refresh_token", token.refreshToken], tokenData),
    ]);
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
    await this.kv.set(["authorization_code", code.authorizationCode], codeData);
    return code;
  }

  async getAuthorizationCode(authorizationCode) {
    return this.kv
      .get(["authorization_code", authorizationCode])
      .then((res) => res.value);
  }

  async revokeAuthorizationCode(code) {
    await this.kv.delete(["authorization_code", code.authorizationCode]);
    return true;
  }

  async getUserFromClient(client) {
    console.log(client);
    // TODO: find related user
    return this.users[0];
  }

  async getRefreshToken(refreshToken) {
    return this.kv
      .get(["refresh_token", refreshToken])
      .then((res) => res.value);
  }

  async revokeToken(token) {
    await this.kv.delete(["access_token", token.accessToken]);
    return true;
  }
}
