import { createJob, getJobById, listJobs, updateJob } from '../services/supabase.js';
import { handleError, jsonResponse, parseJsonBody } from '../utils/http.js';
import { validateJobPayload } from '../utils/validation.js';

function single(recordset) {
  if (Array.isArray(recordset)) {
    return recordset[0] || null;
  }
  return recordset || null;
}

export async function handleGetJobs(res) {
  try {
    const jobs = await listJobs();
    jsonResponse(res, 200, { data: jobs });
  } catch (error) {
    handleError(res, error);
  }
}

export async function handleGetJob(res, params) {
  try {
    const job = await getJobById(params.id);
    if (!job) {
      jsonResponse(res, 404, { error: 'Job not found' });
      return;
    }
    jsonResponse(res, 200, { data: job });
  } catch (error) {
    handleError(res, error);
  }
}

export async function handleCreateJob(req, res) {
  try {
    const body = await parseJsonBody(req);
    const { errors, body: payload } = validateJobPayload(body);
    if (errors.length > 0) {
      jsonResponse(res, 400, { error: 'Validation failed', details: errors });
      return;
    }

    const result = await createJob({
      status: 'offen',
      ...payload
    });

    jsonResponse(res, 201, { data: single(result) });
  } catch (error) {
    handleError(res, error);
  }
}

export async function handleUpdateJob(req, res, params) {
  try {
    const body = await parseJsonBody(req);
    const { errors, body: payload } = validateJobPayload(body, { partial: true });
    if (errors.length > 0) {
      jsonResponse(res, 400, { error: 'Validation failed', details: errors });
      return;
    }

    const updated = await updateJob(params.id, payload);
    if (!updated) {
      jsonResponse(res, 404, { error: 'Job not found' });
      return;
    }

    jsonResponse(res, 200, { data: single(updated) });
  } catch (error) {
    handleError(res, error);
  }
}
