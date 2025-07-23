import { v4 as uuidv4 } from 'uuid'

import { excludeEmployeeWorker, getRandomInt, redistributeRoles, terminateWorkers } from '../helpers/helpers'

let employees = []
let sprint
let T
const roles = ['БА', 'СА', 'TL', 'DV', 'QA']

const taskQueues = {
  БА: [],
  СА: [],
  TL: [],
  DV: [],
  QA: [],
}

export const createWorker = () => {
  const worker = new Worker(new URL('./taskWorker.js', import.meta.url), { type: 'module' })
  return worker
}

const findEmployee = (role, task) => {
  const employee = employees.find((emp) => emp.role.includes(role) && !emp.currentActivity)
  if (!employee && !taskQueues[role].find((t) => t.id === task.id)) {
    taskQueues[role].push(task)
    return null
  }
  employee.currentProcessingRole = role
  return employee
}

const findEmployeeName = (employee) => {
  return employees.findIndex((el) => el.id === employee.id) + 1
}

const isSprintDone = () => {
  const allStoriesCompleted = sprint.stories.every(
    (story) =>
      (story.issues?.every((issue) => issue.status === 'Успех') ?? true) &&
      (story.bugs?.every((bug) => bug.status === 'Успех') ?? true),
  )
  const allEmployeesAvailable = employees.every((employee) => !employee.currentActivity)
  const allQueuesEmpty = roles.every((role) => taskQueues[role].length === 0)
  return allStoriesCompleted && allEmployeesAvailable && allQueuesEmpty
}

const updateSprintActivities = (updatedItem) => {
  if (updatedItem.type === 'Стори') {
    const storyIndex = sprint.stories.findIndex((s) => s.id === updatedItem.id)
    if (storyIndex !== -1) {
      sprint.stories[storyIndex] = { ...sprint.stories[storyIndex], ...updatedItem }
    }
    return
  }

  const story = sprint.stories.find((story) => story.id === updatedItem.storyId)
  if (!story) return

  if (updatedItem.type === 'Задача') {
    const issueIndex = story.issues.findIndex((issue) => issue.id === updatedItem.id)
    if (issueIndex !== -1) {
      story.issues[issueIndex] = { ...story.issues[issueIndex], ...updatedItem }
    }
  } else if (updatedItem.type === 'Баг') {
    const bugIndex = story.bugs?.findIndex((bug) => bug.id === updatedItem.id)
    if (bugIndex !== -1) {
      story.bugs[bugIndex] = { ...story.bugs[bugIndex], ...updatedItem }
    }
  }
}

const performTask = (employee, task, role) => {
  if (!employee.worker) {
    return
  }
  task.status = 'В процессе'
  employee.currentActivity = task
  self.postMessage({
    message: 'updateLogs',
    log: {
      text: `Сотрудник ${findEmployeeName(employee)}-${employee.role} приступил к выполнению '${task.type}-${task.name}'`,
      status: 'В процессе',
    },
  })
  self.postMessage({ message: 'updateEmployees', employees: excludeEmployeeWorker(employees) })
  employee.worker.postMessage({ task: task, employee: excludeEmployeeWorker(employee), role: role, globalTime: T })
}

const handleTaskCompletion = (employee, task) => {
  employee.currentActivity = null
  updateSprintActivities(task)

  if (task.status !== 'В процессе') {
    employee.completedActivities.unshift({ ...task })
    self.postMessage({
      message: 'updateLogs',
      log: {
        text: `Сотрудник ${findEmployeeName(employee)}-${employee.currentProcessingRole} выполнил '${task.type}-${task.name}' со статусом '${task.status}'`,
        status: task.status,
      },
    })
  }

  const processNextTask = (role, taskToProcess) => {
    let nextEmployee = findEmployee(role, taskToProcess)
    if (nextEmployee) {
      performTask(nextEmployee, taskToProcess, role)
    }
  }

  switch (employee.currentProcessingRole) {
    case 'БА':
      if (task.status === 'Успех') {
        processNextTask('СА', task)
      } else if (task.status === 'На Доработку') {
        processNextTask('БА', task)
      }
      break
    case 'СА':
      if (task.status === 'Успех') {
        processNextTask('TL', task)
      } else if (task.status === 'На Доработку') {
        processNextTask('БА', task)
      }
      break
    case 'TL':
      if (task.status === 'Успех') {
        if (task.type === 'Стори') {
          const k = getRandomInt(1, 3)
          task.issues = Array.from({ length: k }, (_, i) => ({
            id: uuidv4(),
            name: `${task.name} (${i + 1})`,
            status: 'В процессе',
            type: 'Задача',
            previousPerformerId: employee.id,
            previousPerformerRole: 'TL',
            quality: Math.min(employee.skill, 1),
            storyId: task.id,
          }))
          const story = sprint.stories.find((story) => story.id === task.id)
          if (story) {
            story.issues = task.issues
          }

          self.postMessage({
            message: 'updateLogs',
            log: {
              text: `Сотрудник ${findEmployeeName(employee)}-${employee.currentProcessingRole} создал ${k} задач и передал их DV'`,
              status: null,
            },
          })

          task.issues.forEach((issue) => {
            processNextTask('DV', issue)
          })
        } else if (task.type === 'Задача' || task.type === 'Баг') {
          processNextTask('DV', task)
        }
      } else if (task.status === 'На Доработку') {
        processNextTask('СА', task)
      }
      break
    case 'DV': {
      const story = sprint.stories.find((story) => story.id === task.storyId)
      if (task.status === 'Успех') {
        if (
          task.status === 'Успех' &&
          task.type === 'Задача' &&
          story.issues?.every((issue) => issue.status === 'Успех') &&
          story.issues.length > 0 &&
          story.previousPerformerRole === 'TL'
        ) {
          processNextTask('QA', story)
        } else if (task.type === 'Баг') {
          processNextTask('QA', task)
        }
      } else if (task.status === 'На Доработку') {
        processNextTask('TL', task)
      }
      break
    }
    case 'QA':
      if (task.status === 'Успех' && task.type === 'Стори') {
        const f = 3
        if (f > 0) {
          task.bugs = Array.from({ length: f }, (_, i) => ({
            id: uuidv4(),
            name: `${task.name} (${i + 1})`,
            status: 'В процессе',
            type: 'Баг',
            previousPerformerId: employee.id,
            previousPerformerRole: 'QA',
            quality: Math.min(employee.skill, 1),
            storyId: task.id,
          }))
          const story = sprint.stories.find((story) => story.id === task.id)
          if (story) {
            story.bugs = task.bugs
          }
          self.postMessage({
            message: 'updateLogs',
            log: {
              text: `Сотрудник ${findEmployeeName(employee)}-${employee.currentProcessingRole} нашел ${f} багов и передал их DV`,
              status: null,
            },
          })
          task.bugs.forEach((bug) => {
            processNextTask('DV', bug)
          })
        }
      } else if (task.status === 'На Доработку' && task.type === 'Стори') {
        performTask(employee, task)
      } else if (task.status === 'На Доработку' && task.type === 'Баг') {
        processNextTask('DV', task)
      }
      break
    default:
      break
  }

  if (taskQueues[employee.currentProcessingRole].length > 0) {
    const nextTask = taskQueues[employee.currentProcessingRole].shift()
    performTask(employee, nextTask)
  }

  if (employee.role.includes('QA') && isSprintDone()) {
    sprint.status = 'Done'
    employees = terminateWorkers(employees)
    self.postMessage({ message: 'updateEmployees', employees: employees })
    self.postMessage({ message: 'sprintDone', sprint: sprint })
    self.postMessage({
      message: 'updateLogs',
      log: { text: `Спринт завершен`, status: 'Успех' },
    })
  }
}

self.onmessage = (e) => {
  const { message } = e.data
  switch (message) {
    case 'initEmployees': {
      const maxThreads = navigator.hardwareConcurrency
      if (e.data.time) {
        T = e.data.time * 1000
      } else {
        T = 500
      }

      employees = Array.from({ length: e.data.employeesQuantity ? e.data.employeesQuantity : maxThreads }, () => ({
        id: uuidv4(),
        role: null,
        currentProcessingRole: null,
        skill: (Math.floor(Math.random() * 90) + 10) / 100,
        currentActivity: null,
        completedActivities: [],
        worker: null,
      }))
      employees = redistributeRoles(employees, roles)
      self.postMessage({ message: 'updateEmployees', employees: employees })
      break
    }
    case 'deleteEmployee': {
      const employee = employees.find((emp) => emp.id === e.data.id)
      if (employee && employee.worker) {
        employee.worker.terminate()
      }
      employees = employees.filter((emp) => emp.id !== e.data.id)
      if (employees.length <= 5) {
        employees = redistributeRoles(employees, roles)
      }
      self.postMessage({ message: 'updateEmployees', employees: excludeEmployeeWorker(employees) })
      break
    }
    case 'addEmployee': {
      const newEmployee = {
        id: uuidv4(),
        role: null,
        currentProcessingRole: null,
        skill: (Math.floor(Math.random() * 90) + 10) / 100,
        currentActivity: null,
        completedActivities: [],
        worker: null,
      }

      if (sprint && sprint.status === 'In Progress') {
        const worker = createWorker()
        newEmployee.worker = worker
        worker.onmessage = (e) => {
          const { message, task, employee: updatedEmployeeData } = e.data
          if (message === 'taskCompleted') {
            const emp = employees.find((emp) => emp.id === updatedEmployeeData.id)
            if (emp) {
              handleTaskCompletion(emp, task)
            }
          }
        }
      }

      employees = [...employees, newEmployee]
      employees = redistributeRoles(employees, roles)
      self.postMessage({ message: 'updateEmployees', employees: excludeEmployeeWorker(employees) })
      break
    }
    case 'startSprint':
      employees = employees.map((employee) => {
        const worker = createWorker()
        worker.onmessage = (e) => {
          const { message, task, employee: updatedEmployeeData } = e.data
          if (message === 'taskCompleted') {
            const emp = employees.find((emp) => emp.id === updatedEmployeeData.id)
            if (emp) {
              handleTaskCompletion(emp, task)
            }
          }
        }
        return { ...employee, worker }
      })
      sprint = e.data.sprint
      sprint.status = 'In Progress'
      sprint.stories.forEach((story) => {
        let ba = findEmployee('БА', story)
        if (ba) {
          performTask(ba, story)
        }
      })
      break
    default:
      break
  }
}
