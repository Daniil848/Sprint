onmessage = (e) => {
  const { task, employee, role, globalTime } = e.data

  const performTaskInWorker = (task, employee) => {
    const timeToComplete = globalTime / employee.skill
    const quality = Math.min(employee.skill, 1)
    const successProbability = quality * 100
    const isSuccessful = Math.random() * 100 < successProbability

    task.status = 'В процессе'
    postMessage({ message: 'updateTask', task })

    setTimeout(() => {
      if (isSuccessful) {
        task.status = 'Успех'
        task.quality = quality
        task.previousPerformerId = employee.id
        task.previousPerformerRole = role
      } else {
        task.status = 'На Доработку'
        task.quality = task.quality ? task.quality + (1 - task.quality) / 2 : employee.skill
      }

      postMessage({ message: 'taskCompleted', task, employee })
    }, timeToComplete)
  }

  performTaskInWorker(task, employee)
}
