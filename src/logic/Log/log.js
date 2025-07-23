import store from '../../store/store'

const renderLogs = () => {
  const state = store.getState()
  const logsList = document.querySelector('.logs_list')

  logsList.innerHTML = ''

  state.logs.forEach((log) => {
    const li = document.createElement('li')
    li.classList.add('log')

    if (log.status === 'Успех') {
      li.classList.add('log-green')
    } else if (log.status === 'На Доработку') {
      li.classList.add('log-red')
    } else if (log.status === 'В процессе') {
      li.classList.add('log-yellow')
    } else {
      li.classList.add('log-blue')
    }

    li.innerText = log.text

    logsList.appendChild(li)
  })
}
store.subscribe(renderLogs)

renderLogs()
