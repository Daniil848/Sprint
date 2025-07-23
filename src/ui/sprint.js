import { employeesWorker, sprintsWorker } from '../logic/workers/workers'
import { updateSprints } from '../store/actions'
import store from '../store/store'

sprintsWorker.onmessage = (e) => {
  if (e.data.message === 'updateSprints') {
    store.dispatch(updateSprints(e.data.sprints))
  }
}

const renderSprints = () => {
  const state = store.getState()
  const sprintList = document.querySelector('.sprints__list')

  sprintList.innerHTML = ''

  const addSprintBtn = document.createElement('button')
  addSprintBtn.classList.add('sprint', 'sprint_add')
  addSprintBtn.innerHTML = 'Добавить спринт +'
  sprintList.appendChild(addSprintBtn)
  addSprintBtn.addEventListener('click', () => {
    sprintsWorker.postMessage({ message: 'addSprint' })
  })

  state.sprints.forEach((sprint, index) => {
    const li = document.createElement('li')
    li.classList.add('sprint')

    li.innerHTML = `            
      <div class="sprint__header">
        Спринт ${index + 1} 
        <button class="delete-sprint-btn" data-id="${sprint.id}">
          Удалить
        </button>
      </div>
      <div>Статус: ${sprint.status}</div>
      Стори:
      <ul class="sprint__stories"></ul>
      <li class="story">
        <input type="text" class="story_input"/>
        <button disabled class="add-story-btn">Добавить стори</button>
      </li>
      <button disabled class="start-sprint-btn">
        Запуск
      </button>
     `
    sprintList.appendChild(li)

    const deleteSprintButton = li.querySelector('.delete-sprint-btn')
    const updateEmployeesButton = document.querySelector('.update_employess')
    if (sprint.status !== 'To Do') {
      deleteSprintButton.disabled = true
    }
    if (sprint.status === 'In Progress') {
      updateEmployeesButton.disabled = true
    } else {
      updateEmployeesButton.disabled = false
    }
    deleteSprintButton.addEventListener('click', () => {
      sprintsWorker.postMessage({ message: 'deleteSprint', id: sprint.id })
    })

    const storiesList = li.querySelector('.sprint__stories')

    sprint.stories.forEach((story) => {
      const storyItem = document.createElement('li')
      storyItem.classList.add('story')
      storyItem.textContent = story.name
      storiesList.appendChild(storyItem)

      const deleteStoryButton = document.createElement('button')
      deleteStoryButton.innerText = 'Удалить стори'
      storyItem.appendChild(deleteStoryButton)
      if (sprint.status !== 'To Do') {
        deleteStoryButton.disabled = true
      }
      deleteStoryButton.addEventListener('click', () => {
        sprintsWorker.postMessage({ message: 'deleteStory', sprintId: sprint.id, storyId: story.id })
      })
    })

    const input = li.querySelector('.story_input')
    const addStoryButton = li.querySelector('.add-story-btn')
    input.addEventListener('input', () => {
      addStoryButton.disabled = !input.value.trim()
    })

    addStoryButton.addEventListener('click', () => {
      const storyText = input.value.trim()
      if (!storyText) return

      sprintsWorker.postMessage({ message: 'addStory', id: sprint.id, name: storyText })

      input.value = ''
      addStoryButton.disabled = true
    })

    const startSprintBtn = li.querySelector('.start-sprint-btn')
    if (sprint.status !== 'To Do' || !sprint.stories.length) {
      startSprintBtn.disabled = true
    } else {
      startSprintBtn.disabled = false
    }
    startSprintBtn.addEventListener('click', () => {
      sprintsWorker.postMessage({ message: 'startSprint', id: sprint.id })
      employeesWorker.postMessage({ message: 'startSprint', sprint: sprint })
      startSprintBtn.disabled = true
    })
  })

  const isSprintInProgress = state.sprints.some((sprint) => sprint.status === 'In Progress')

  if (isSprintInProgress) {
    document.querySelectorAll('.start-sprint-btn').forEach((btn) => {
      btn.disabled = true
    })
  }
}

store.subscribe(renderSprints)

renderSprints()
