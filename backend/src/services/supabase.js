import { env } from '../config.js';

const restBase = `${env.supabaseUrl}/rest/v1`;

function buildHeaders(prefer) {
  const headers = {
    apikey: env.supabaseServiceKey,
    Authorization: `Bearer ${env.supabaseServiceKey}`,
    'Content-Type': 'application/json'
  };
  if (prefer) {
    headers.Prefer = prefer;
  }
  return headers;
}

function applyFilters(url, filters = {}) {
  Object.entries(filters).forEach(([column, value]) => {
    url.searchParams.set(column, `eq.${value}`);
  });
}

async function supabaseRequest(path, options = {}) {
  const { method = 'GET', body, select = '*', filters, prefer } = options;
  const url = new URL(`${restBase}${path}`);

  if (select) {
    url.searchParams.set('select', select);
  }
  applyFilters(url, filters);

  const response = await fetch(url, {
    method,
    headers: buildHeaders(prefer),
    body: body ? JSON.stringify(body) : undefined
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Supabase request failed');
    error.details = data;
    error.status = response.status;
    throw error;
  }

  return data;
}

export function listJobs() {
  return supabaseRequest('/jobs', {
    select: 'id,title,job_type,status,planned_start,planned_end,customer_id,created_at,updated_at'
  });
}

export async function getJobById(id) {
  const data = await supabaseRequest('/jobs', {
    filters: { id },
    select: 'id,title,description,job_type,status,planned_start,planned_end,customer_id,created_by,assigned_by,created_at,updated_at'
  });
  return Array.isArray(data) ? data[0] : null;
}

export function createJob(payload) {
  return supabaseRequest('/jobs', {
    method: 'POST',
    body: payload,
    prefer: 'return=representation',
    select: 'id,title,description,job_type,status,planned_start,planned_end,customer_id,created_by,assigned_by,created_at,updated_at'
  });
}

export async function updateJob(id, updates) {
  const data = await supabaseRequest('/jobs', {
    method: 'PATCH',
    filters: { id },
    body: updates,
    prefer: 'return=representation',
    select: 'id,title,description,job_type,status,planned_start,planned_end,customer_id,created_by,assigned_by,updated_at'
  });
  return Array.isArray(data) ? data[0] : null;
}

export function listEmployees() {
  return supabaseRequest('/users', {
    select: 'id,username,email,role,status,created_at,updated_at'
  });
}

export async function getEmployeeById(id) {
  const data = await supabaseRequest('/users', {
    filters: { id },
    select: 'id,username,email,role,status,vacation_days_total,vacation_days_left,sick_days_total,created_at,updated_at'
  });
  return Array.isArray(data) ? data[0] : null;
}

export function createEmployee(payload) {
  return supabaseRequest('/users', {
    method: 'POST',
    body: payload,
    prefer: 'return=representation',
    select: 'id,username,email,role,status,vacation_days_total,vacation_days_left,sick_days_total,created_at,updated_at'
  });
}
