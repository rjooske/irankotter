export interface ServerEndpoint {
  path: string;
  handler: (input: any) => any;
}
