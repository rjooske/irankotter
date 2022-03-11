export function sleep(duration: number) {
  return new Promise<void>((res) => setTimeout(res, duration));
}
