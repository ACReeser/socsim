import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { GetRandomNumber } from './WorldGen';
import { SampleNormalDistribution } from './simulation/Utils';

test('random works', () => {
  const r = GetRandomNumber('abcdef');
  expect(r).toBeGreaterThan(-1);
});

test('normal distribution works', () => {
  const r = SampleNormalDistribution('abc');
  expect(r).toBeGreaterThan(-1);
});

test('renders start game modal', () => {
  const { getAllByText, getByText } = render(<App />);
  const headers = getAllByText(/utopia/i);
  headers.forEach(x => 
    expect(x).toBeInTheDocument()
  );
  const newGame = getByText(/start new game/i);
  expect(newGame).toBeInTheDocument();
});
