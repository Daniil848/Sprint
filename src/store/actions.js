export const updateEmployees = (employees) => {
  return {
    type: 'UPDATE_EMPLOYEES',
    payload: employees,
  }
}

export const updateSprints = (sprints) => {
  return {
    type: 'UPDATE_SPRINTS',
    payload: sprints,
  }
}

export const updateLogs = (log) => {
  return {
    type: 'UPDATE_LOGS',
    payload: log,
  }
}
