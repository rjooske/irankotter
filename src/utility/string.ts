export function createRandomString(length: number) {
  let result = "";
  for (let i = 0; i < length; i++) {
    const char = Math.trunc(36 * Math.random()).toString(36);
    if (Math.random() < 0.5) {
      result += char.toUpperCase();
    } else {
      result += char.toLowerCase();
    }
  }
  return result;
}
