import { employeesWorker, sprintsWorker } from '../logic/workers/workers'
import { updateEmployees, updateLogs } from '../store/actions'
import store from '../store/store'

employeesWorker.postMessage({ message: 'initEmployees' })

employeesWorker.onmessage = (e) => {
  switch (e.data.message) {
    case 'updateEmployees':
      store.dispatch(updateEmployees(e.data.employees))
      break
    case 'sprintDone':
      sprintsWorker.postMessage({ message: 'updateSprint', sprint: e.data.sprint })
      break
    case 'updateLogs':
      store.dispatch(updateLogs(e.data.log))
      break
    default:
      break
  }
}

const employeesInput = document.querySelector('.employees_quantity')
const globalTimeInput = document.querySelector('.global_time')
const updateEmployeesButton = document.querySelector('.update_employess')
updateEmployeesButton.addEventListener('click', () => {
  const employeesQuantity = employeesInput.value
  const globalTime = globalTimeInput.value
  employeesWorker.postMessage({ message: 'initEmployees', employeesQuantity: employeesQuantity, time: globalTime })
})

const renderEmployees = () => {
  const state = store.getState()
  const employeesList = document.querySelector('.employees__list')

  employeesList.innerHTML = ''

  const addBtn = document.createElement('li')
  addBtn.classList.add('employee', 'employee_add')
  addBtn.innerHTML = `<button>+</button>`
  employeesList.appendChild(addBtn)

  const addEmployeeBtn = document.querySelector('.employee_add')
  addEmployeeBtn.addEventListener('click', () => {
    employeesWorker.postMessage({ message: 'addEmployee' })
  })

  state.employees.forEach((employee, index) => {
    const li = document.createElement('li')
    li.classList.add('employee')

    li.innerHTML = `
      <div class="employee__header">
        Сотрудник ${index + 1}
        <button class="delete_employee_btn" data-id="${employee.id}">
          Удалить
        </button>
      </div>
      <ul>
        <li>Роль: ${employee.role.join('+')}</li>
        <li>Навык: ${employee.skill}</li>
      </ul>
      <span class="activity">Активность: ${employee.currentActivity ? `${employee.currentActivity.type} ${employee.currentActivity.name}-${employee.currentActivity.status}` : ''}</span>
      <span class="employee__activities_title">История:</span>
      <ul class="employee__activities"></ul>
      `
    employeesList.appendChild(li)

    const completedActivities = li.querySelector('.employee__activities')
    employee.completedActivities.forEach((activity) => {
      const activityLi = document.createElement('li')
      activityLi.classList.add('activity')
      activityLi.innerHTML = `<span>${activity.type || ''}: ${activity.name}-${activity.status}</span>`
      completedActivities.appendChild(activityLi)
    })

    const deleteEmployeeBtn = li.querySelector('.delete_employee_btn')
    deleteEmployeeBtn.addEventListener('click', () => {
      employeesWorker.postMessage({ message: 'deleteEmployee', id: employee.id })
    })
  })
}

store.subscribe(renderEmployees)

renderEmployees()
