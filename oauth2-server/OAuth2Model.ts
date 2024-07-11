export interface Client {
  id: string;
  clientSecret: string;
  redirectUris: string[];
  grants: string[];
}
export interface User {
  username: string;
  password: string;
}
export interface Token {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  client: {
    id: string;
    grants: string[];
  };
  user: {
    id: string;
  };
}
export interface AuthorizationCode {
  authorizationCode: string;
  expiresAt: Date;
  redirectUri: string;
  client: {
    id: string;
    grants: string[];
  };
  user: {
    id: string;
  };
}
export interface OAuth2Model {
  getAccessToken(accessToken: string): Promise<Token | undefined>;
  getClient(
    clientId: string,
    clientSecret?: string
  ): Promise<Client | undefined>;
  getUser(username: string, password: string): Promise<User | undefined>;
  saveToken(token: Token, client: Client, user: User): Promise<Token>;
  saveAuthorizationCode(
    code: AuthorizationCode,
    client: Client,
    user: User
  ): Promise<AuthorizationCode>;
  getAuthorizationCode(
    authorizationCode: string
  ): Promise<AuthorizationCode | undefined>;
  revokeAuthorizationCode(code: AuthorizationCode): Promise<boolean>;
  getUserFromClient(client: Client): Promise<User | undefined>;
  getRefreshToken(refreshToken: string): Promise<Token | undefined>;
  revokeToken(token: Token): Promise<boolean>;
}
export interface OAuth2ServerModel {
  registerUser(user: User): Promise<boolean>;
  registerClient(client: Client): Promise<boolean>;
}
