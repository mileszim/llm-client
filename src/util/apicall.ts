import superagent from 'superagent';

import Config from './config';

/**
 * Util: API details
 * @export
 */
export type API = {
  url: string;
  name?: string;
  key?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers?: any;
};

export const apiCall = async <
  APIType extends API,
  Request extends object,
  Response
>(
  api: APIType,
  json: Request
): Promise<Response> => {
  const baseUrl = Config.useProxy ? Config.proxyEndpoint : api.url;

  const apiPath = api.name ?? '/';
  const apiUrl = new URL(apiPath, baseUrl).toString();

  const headers = {
    ...api.headers,
    Authorization: api.key ? `Bearer ${api.key}` : undefined,
  };

  return await superagent
    .post(apiUrl)
    .send(json)
    .set(headers)
    .type('json')
    .accept('json')
    .retry(3)
    .then(({ body: data }) => Promise.resolve(data))
    .catch(({ response, code, syscall, address, port }) => {
      if (!response) {
        return Promise.reject({
          apiUrl,
          code,
          syscall,
          address,
          port,
          request: json,
        });
      }
      const { headers, status, body } = response;
      return Promise.reject({
        pathname: apiPath,
        statusCode: status,
        headers,
        request: json,
        response: body,
      });
    });
};

export const apiCallWithUpload = async <APIType extends API, Request, Response>(
  api: APIType,
  json: Request,
  file: string
): Promise<Response> => {
  if (!file) {
    throw new Error('File is required');
  }

  const headers = {
    ...api.headers,
    Authorization: api.key ? `Bearer ${api.key}` : undefined,
  };

  const baseUrl = api.url;
  const apiPath = api.name ?? '/';
  const apiUrl = new URL(apiPath, baseUrl).toString();

  return await superagent
    .post(apiUrl)
    .retry(3)
    .attach('file', file)
    .set(headers)
    .field(json as { [fieldName: string]: string })
    .then(({ body: data }) => Promise.resolve(data));
};
