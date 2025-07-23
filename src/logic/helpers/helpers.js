export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const excludeEmployeeWorker = (emps) => {
  // eslint-disable-next-line no-unused-vars
  const omitWorker = ({ worker, ...rest }) => rest
  return Array.isArray(emps) ? emps.map(omitWorker) : omitWorker(emps)
}

export const terminateWorkers = (emps) => {
  return [...emps].forEach((employee) => {
    if (employee.worker) {
      employee.worker.terminate()
      employee.worker = null
    }
  })
}

export const redistributeRoles = (emps, roles) => {
  const count = emps.length
  const newEmployees = emps.map((emp) => ({ ...emp }))

  if (count >= 5) {
    newEmployees.forEach((emp, i) => {
      emp.role = [roles[i % roles.length]]
    })
    return newEmployees
  }

  switch (count) {
    case 4:
      newEmployees[0].role = ['БА']
      newEmployees[1].role = ['СА']
      newEmployees[2].role = ['TL', 'DV']
      newEmployees[3].role = ['QA']
      break
    case 3:
      newEmployees[0].role = ['БА', 'СА']
      newEmployees[1].role = ['TL', 'DV']
      newEmployees[2].role = ['QA']
      break
    case 2:
      newEmployees[0].role = ['БА', 'СА']
      newEmployees[1].role = ['TL', 'DV', 'QA']
      break
    case 1:
      newEmployees[0].role = ['БА', 'СА', 'TL', 'DV', 'QA']
      break
    default:
      return newEmployees
  }

  return newEmployees
}
