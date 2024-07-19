import { snake } from "npm:naming-style";

/** 标准 OAuth 是蛇形命名法，所以需要转化 key 值 */
export const toSnakeObject = (data) => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (typeof value === "object" &&
        !(value instanceof Array) &&
        !(value instanceof Date)) {
        return [snake(key), toSnakeObject(value)];
      }
      return [snake(key), value];
    })
  );
};
