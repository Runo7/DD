import { env } from '../config.js';

export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function jsonResponse(res, statusCode, payload) {
  setCorsHeaders(res);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

export async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let rawBody = '';

    req.on('data', (chunk) => {
      rawBody += chunk.toString();
      if (rawBody.length > 1e6) {
        reject(new Error('Payload too large'));
        req.connection.destroy();
      }
    });

    req.on('end', () => {
      if (!rawBody) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(rawBody);
        resolve(parsed);
      } catch (error) {
        reject(new Error('Invalid JSON payload'));
      }
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

export function handleError(res, error) {
  const status = error.status || 500;
  const message = error.message || 'Unexpected error';
  jsonResponse(res, status, { error: message, details: error.details });
}

export function notFound(res) {
  jsonResponse(res, 404, { error: 'Not Found' });
}

export function healthcheck(res) {
  jsonResponse(res, 200, { status: 'ok', service: 'handwerker-api', port: env.port });
}
