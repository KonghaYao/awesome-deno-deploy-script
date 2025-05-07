import { Client, OAuth2ServerModel, User } from "./OAuth2Model.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

export class DenoKVModel implements OAuth2ServerModel {
    constructor(public kv: any) {}
    async registerUser(user: User, overwrite = false): Promise<boolean> {
        if (
            overwrite === false &&
            !(await this.kv.get(["user", user.username])).value
        )
            return false;
        if (!user.password) return false;
        const salt = await bcrypt.genSalt(8);
        user.password = await bcrypt.hash(user.password, salt);
        return this.kv.set(["user", user.username], user);
    }
    async registerClient(client: Client, overwrite = false): Promise<boolean> {
        if (
            overwrite === false &&
            !(await this.kv.get(["client", client.id])).value
        )
            return false;
        return this.kv.set(["client", client.id], client);
    }

    async getAccessToken(accessToken) {
        return this.kv
            .get(["access_token", accessToken])
            .then((res) => res.value);
    }

    async getClient(clientId, clientSecret) {
        return this.kv.get(["client", clientId]).then((res) => res.value);
    }
    async validateRedirectUri(redirectUri, client) {
        return client.redirectUris.includes(redirectUri);
    }

    async getUser(username, password) {
        if (!password) return null;
        return this.kv
            .get(["user", username])
            .then((res) => res.value)
            .then(async (res: User) => {
                const isCorrect = await bcrypt.compare(password, res.password);
                if (isCorrect) return res;
            });
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
                username: user.username,
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
            redirectUri: client.redirectUris[0],
            user: {
                username: user.username,
            },
        };
        await this.kv.set(
            ["authorization_code", code.authorizationCode],
            codeData
        );
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
