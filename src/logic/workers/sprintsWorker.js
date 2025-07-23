import { v4 as uuidv4 } from 'uuid'

let sprints = []

self.onmessage = (e) => {
  switch (e.data.message) {
    case 'addSprint':
      sprints = [
        ...sprints,
        {
          id: uuidv4(),
          stories: [],
          status: 'To Do',
        },
      ]
      self.postMessage({ message: 'updateSprints', sprints: sprints })
      break
    case 'deleteSprint':
      sprints = sprints.filter((sprint) => sprint.id !== e.data.id)
      self.postMessage({ message: 'updateSprints', sprints: sprints })
      break
    case 'updateSprint': {
      sprints = sprints.map((sprint) => (sprint.id === e.data.sprint.id ? e.data.sprint : sprint))
      self.postMessage({ message: 'updateSprints', sprints: sprints })
      break
    }
    case 'startSprint': {
      const sprint = sprints.find((sprint) => sprint.id === e.data.id)
      if (sprint) {
        sprint.status = 'In Progress'
        self.postMessage({ message: 'updateSprints', sprints })
      }
      break
    }
    case 'addStory': {
      const sprint = sprints.find((sprint) => sprint.id === e.data.id)
      if (sprint) {
        sprint.stories.push({
          id: uuidv4(),
          name: e.data.name,
          type: 'Стори',
          status: null,
          quality: null,
          previousPerformerId: null,
          previousPerformerRole: '',
          issues: [],
          bugs: [],
        })
        self.postMessage({ message: 'updateSprints', sprints: sprints })
      }
      break
    }
    case 'deleteStory': {
      const sprint = sprints.find((sprint) => sprint.id === e.data.sprintId)
      if (sprint) {
        sprint.stories = sprint.stories.filter((story) => story.id !== e.data.storyId)
        self.postMessage({ message: 'updateSprints', sprints: sprints })
      }
      break
    }
    default:
      break
  }
}
