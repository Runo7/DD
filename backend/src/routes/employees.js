import { createEmployee, getEmployeeById, listEmployees } from '../services/supabase.js';
import { handleError, jsonResponse, parseJsonBody } from '../utils/http.js';
import { validateUserPayload } from '../utils/validation.js';

function single(recordset) {
  if (Array.isArray(recordset)) {
    return recordset[0] || null;
  }
  return recordset || null;
}

export async function handleGetEmployees(res) {
  try {
    const employees = await listEmployees();
    jsonResponse(res, 200, { data: employees });
  } catch (error) {
    handleError(res, error);
  }
}

export async function handleGetEmployee(res, params) {
  try {
    const employee = await getEmployeeById(params.id);
    if (!employee) {
      jsonResponse(res, 404, { error: 'Employee not found' });
      return;
    }
    jsonResponse(res, 200, { data: employee });
  } catch (error) {
    handleError(res, error);
  }
}

export async function handleCreateEmployee(req, res) {
  try {
    const body = await parseJsonBody(req);
    const { errors, body: payload } = validateUserPayload(body);
    if (errors.length > 0) {
      jsonResponse(res, 400, { error: 'Validation failed', details: errors });
      return;
    }

    const created = await createEmployee(payload);
    jsonResponse(res, 201, { data: single(created) });
  } catch (error) {
    handleError(res, error);
  }
}
