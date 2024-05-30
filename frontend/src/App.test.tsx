import {render, screen} from '@testing-library/react'
import App from './App'

it('should have Vite + React', ()=> {
    render(<App/>)

    const message = screen.queryByText(/Vite\s\+\sReact/i)
    expect(message).toBeVisible();
});