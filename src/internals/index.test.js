import { queryByTestId, screen } from '@testing-library/dom'

it.skip('should pass', () => {
  expect(0).not.toBe(1)
})

it.skip('should render on screen', () => {
  document.body.innerHTML = `
    <div data-testid="container">App</div>
  `

  expect(screen.queryByTestId('container')).toHaveTextContent('App')
})

it.skip('should render DOM elements', () => {
  const root = document.createElement('div')
  const div = document.createElement('div')
  root.append(div)
  div.dataset.testid = 'container'
  div.innerHTML = 'App'

  expect(queryByTestId(root, 'container')).toHaveTextContent('App')
})
