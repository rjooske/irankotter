import { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";

export interface GetRequest {
  url: string;
  headers: IncomingHttpHeaders;
}

export interface PostRequest {
  url: string;
  headers: IncomingHttpHeaders;
  body: string;
}

export interface Response {
  status: number;
  headers?: OutgoingHttpHeaders;
  body?: string;
}

export type GetReceiver = (request: GetRequest) => Promise<Response>;

export type PostReceiver = (request: PostRequest) => Promise<Response>;
