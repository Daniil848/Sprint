export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const excludeEmployeeWorker = (emps) => {
  if (Array.isArray(emps)) {
    return emps.map((emp) => {
      // eslint-disable-next-line no-unused-vars
      return Object.fromEntries(Object.entries(emp).filter(([key, _]) => key !== 'worker'))
    })
  } else {
    // eslint-disable-next-line no-unused-vars
    return Object.fromEntries(Object.entries(emps).filter(([key, _]) => key !== 'worker'))
  }
}
