import store from '../store/store'

const renderLogs = () => {
  const state = store.getState()
  const logsList = document.querySelector('.logs_list')

  logsList.innerHTML = ''

  state.logs.forEach((log) => {
    const li = document.createElement('li')
    li.classList.add('log')

    switch (log.status) {
      case 'Успех':
        li.classList.add('log-green')
        break
      case 'На Доработку':
        li.classList.add('log-red')
        break
      case 'В процессе':
        li.classList.add('log-yellow')
        break
      default:
        li.classList.add('log-blue')
        break
    }

    li.innerText = log.text

    logsList.appendChild(li)
  })
}
store.subscribe(renderLogs)

renderLogs()
