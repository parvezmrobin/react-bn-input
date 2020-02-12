import React from 'react';
import {render} from '@testing-library/react';
import BnInput from './BnInput';

test('rendering', () => {
  const {container} = render(<BnInput/>);
  const inputList = container.getElementsByTagName('input');
  expect(inputList.length).toBe(1);
  const input = inputList[0];
  expect(input).toBeInTheDocument();
  expect(input).not.toHaveFocus();
});

test('focusing', () => {
  const {container} = render(<BnInput autofocus/>);
  const inputList = container.getElementsByTagName('input');
  expect(inputList[0]).toHaveFocus();
});

test('typing', () => {
  const bnInput = render(<BnInput/>);
  const {container, getByText} = bnInput;
  const inputList = container.getElementsByTagName('input');
  const input = inputList[0];
  expect(input).not.toHaveFocus();

  const suggestionsContainer = bnInput.getByRole('listbox');
  expect(suggestionsContainer).toBeEmpty();
  expect(suggestionsContainer).toBeInTheDocument();

  input.dispatchEvent(new FocusEvent('focus'));
  const reactInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  const setInputValue = (val: string) => {
    reactInputSetter?.call(input, val);
    const inputEvent = new Event('input', { bubbles: true});
    input.dispatchEvent(inputEvent);
  };

  setInputValue('amar');
  expect(suggestionsContainer).not.toBeEmpty();
  expect(getByText('আমার')).toBeInTheDocument();

  setInputValue('amar ');
  expect(suggestionsContainer).toBeEmpty();
  expect(input.value).toBe('আমার ');

  setInputValue('আমার sOnar');
  expect(suggestionsContainer).not.toBeEmpty();
  expect(getByText('সোনার')).toBeInTheDocument();

  setInputValue('আমার sOnar ');
  expect(suggestionsContainer).toBeEmpty();
  expect(input.value).toBe('আমার সোনার ');
});
