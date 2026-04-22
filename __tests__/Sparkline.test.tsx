import React from 'react';
import renderer from 'react-test-renderer';
import { Sparkline } from '../components/Sparkline';

describe('Sparkline', () => {
  it('renders with data', () => {
    const tree = renderer
      .create(<Sparkline data={[10, 12, 11, 14, 13, 15]} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders empty with insufficient data', () => {
    const tree = renderer
      .create(<Sparkline data={[5]} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with custom dimensions', () => {
    const tree = renderer
      .create(<Sparkline data={[1, 2, 3, 4, 5]} width={120} height={32} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
