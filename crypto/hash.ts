/* 二进制数据转 hex 字符串 */
export function arrayBufferToHex(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  let hexString = "";
  for (let i = 0; i < uint8Array.length; i++) {
    let hex = uint8Array[i].toString(16);
    if (hex.length === 1) {
      hex = "0" + hex;
    }
    hexString += hex;
  }
  return hexString;
}

/* hash 算法 */
export async function hashString(message, method = "SHA-1") {
  const msgUint8 = new TextEncoder().encode(message); 
  const hashBuffer = await crypto.subtle.digest(method, msgUint8); 
  return arrayBufferToHex(hashBuffer);
}
