export const employeesWorker = new Worker(new URL('./employeesWorker.js', import.meta.url), { type: 'module' })
export const sprintsWorker = new Worker(new URL('./sprintsWorker.js', import.meta.url), { type: 'module' })
