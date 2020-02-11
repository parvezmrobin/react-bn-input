import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  const {getByPlaceholderText} = render(<App />);
  const input = getByPlaceholderText(/type/i);
  expect(input).toBeInTheDocument();
});
