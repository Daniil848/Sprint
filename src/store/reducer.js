const initialState = {
  employees: [],
  sprints: [],
  logs: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_EMPLOYEES':
      return { ...state, employees: [...action.payload] }
    case 'UPDATE_SPRINTS':
      return { ...state, sprints: [...action.payload] }
    case 'UPDATE_LOGS':
      return {
        ...state,
        logs: [action.payload, ...state.logs],
      }
    default:
      return state
  }
}

export default reducer
