import http from 'node:http';
import { env } from './config.js';
import { handleCreateEmployee, handleGetEmployee, handleGetEmployees } from './routes/employees.js';
import { handleCreateJob, handleGetJob, handleGetJobs, handleUpdateJob } from './routes/jobs.js';
import { handleOptions, healthcheck, notFound } from './utils/http.js';

function cleanSegments(pathname) {
  return pathname
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean);
}

function matchRoute(method, pathname) {
  const segments = cleanSegments(pathname);
  const routes = [
    { method: 'GET', pattern: ['health'], handler: (req, res) => healthcheck(res) },
    { method: 'GET', pattern: ['jobs'], handler: (req, res) => handleGetJobs(res) },
    { method: 'POST', pattern: ['jobs'], handler: (req, res) => handleCreateJob(req, res) },
    { method: 'GET', pattern: ['jobs', ':id'], handler: (req, res, params) => handleGetJob(res, params) },
    { method: 'PATCH', pattern: ['jobs', ':id'], handler: (req, res, params) => handleUpdateJob(req, res, params) },
    { method: 'GET', pattern: ['employees'], handler: (req, res) => handleGetEmployees(res) },
    { method: 'POST', pattern: ['employees'], handler: (req, res) => handleCreateEmployee(req, res) },
    { method: 'GET', pattern: ['employees', ':id'], handler: (req, res, params) => handleGetEmployee(res, params) }
  ];

  for (const route of routes) {
    if (route.method !== method) {
      continue;
    }
    if (route.pattern.length !== segments.length) {
      continue;
    }

    const params = {};
    let matches = true;

    for (let i = 0; i < route.pattern.length; i += 1) {
      const expected = route.pattern[i];
      const actual = segments[i];

      if (expected.startsWith(':')) {
        params[expected.slice(1)] = actual;
        continue;
      }

      if (expected !== actual) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return { handler: route.handler, params };
    }
  }

  return null;
}

function createServer() {
  const server = http.createServer(async (req, res) => {
    if (handleOptions(req, res)) {
      return;
    }

    const { pathname } = new URL(req.url, 'http://localhost');
    const matched = matchRoute(req.method, pathname);

    if (!matched) {
      notFound(res);
      return;
    }

    try {
      await matched.handler(req, res, matched.params || {});
    } catch (error) {
      res.statusCode = 500;
      res.end('Internal server error');
      console.error('Unhandled error', error);
    }
  });

  server.listen(env.port, () => {
    console.log(`API server running on port ${env.port}`);
  });
}

try {
  createServer();
} catch (error) {
  console.error('Unable to start server:', error.message);
  process.exit(1);
}
