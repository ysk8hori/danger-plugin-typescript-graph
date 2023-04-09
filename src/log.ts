// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function log(message?: any, ...optionalParams: any[]): void {
  if (!process.env.debug) return;
  console.log(message, ...optionalParams);
}
