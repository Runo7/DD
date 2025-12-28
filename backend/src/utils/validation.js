const allowedJobTypes = ['Wartung', 'Reparatur', 'Installation'];
const allowedJobStatus = ['offen', 'geplant', 'erledigt', 'überfällig'];
const allowedRoles = ['buero', 'handwerker'];
const allowedUserStatus = ['aktiv', 'krank', 'urlaub'];

export function validateJobPayload(payload, { partial = false } = {}) {
  const errors = [];
  const body = {};

  if (!partial || payload.title !== undefined) {
    if (!payload.title || typeof payload.title !== 'string') {
      errors.push('title is required and must be a string');
    } else {
      body.title = payload.title.trim();
    }
  }

  if (payload.description !== undefined) {
    body.description = String(payload.description);
  }

  if (payload.job_type !== undefined) {
    if (!allowedJobTypes.includes(payload.job_type)) {
      errors.push(`job_type must be one of: ${allowedJobTypes.join(', ')}`);
    } else {
      body.job_type = payload.job_type;
    }
  }

  if (payload.status !== undefined) {
    if (!allowedJobStatus.includes(payload.status)) {
      errors.push(`status must be one of: ${allowedJobStatus.join(', ')}`);
    } else {
      body.status = payload.status;
    }
  }

  if (payload.planned_start !== undefined) {
    body.planned_start = payload.planned_start;
  }

  if (payload.planned_end !== undefined) {
    body.planned_end = payload.planned_end;
  }

  if (payload.customer_id !== undefined) {
    body.customer_id = payload.customer_id;
  }

  if (payload.created_by !== undefined) {
    body.created_by = payload.created_by;
  }

  if (payload.assigned_by !== undefined) {
    body.assigned_by = payload.assigned_by;
  }

  return { errors, body };
}

export function validateUserPayload(payload, { partial = false } = {}) {
  const errors = [];
  const body = {};

  if (!partial || payload.username !== undefined) {
    if (!payload.username || typeof payload.username !== 'string') {
      errors.push('username is required and must be a string');
    } else {
      body.username = payload.username.trim();
    }
  }

  if (!partial || payload.email !== undefined) {
    if (!payload.email || typeof payload.email !== 'string') {
      errors.push('email is required and must be a string');
    } else {
      body.email = payload.email.trim();
    }
  }

  if (!partial || payload.password_hash !== undefined) {
    if (!payload.password_hash || typeof payload.password_hash !== 'string') {
      errors.push('password_hash is required and must be a string');
    } else {
      body.password_hash = payload.password_hash;
    }
  }

  if (!partial || payload.role !== undefined) {
    if (!allowedRoles.includes(payload.role)) {
      errors.push(`role must be one of: ${allowedRoles.join(', ')}`);
    } else {
      body.role = payload.role;
    }
  }

  if (!partial || payload.status !== undefined) {
    if (!allowedUserStatus.includes(payload.status)) {
      errors.push(`status must be one of: ${allowedUserStatus.join(', ')}`);
    } else {
      body.status = payload.status;
    }
  }

  if (payload.vacation_days_total !== undefined) {
    body.vacation_days_total = Number(payload.vacation_days_total);
  }

  if (payload.vacation_days_left !== undefined) {
    body.vacation_days_left = Number(payload.vacation_days_left);
  }

  if (payload.sick_days_total !== undefined) {
    body.sick_days_total = Number(payload.sick_days_total);
  }

  return { errors, body };
}
