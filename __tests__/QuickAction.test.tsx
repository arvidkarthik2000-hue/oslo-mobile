import React from 'react';
import renderer from 'react-test-renderer';
import { QuickAction } from '../components/QuickAction';

describe('QuickAction', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(<QuickAction icon="📄" label="File" onPress={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    const tree = renderer
      .create(<QuickAction icon="📷" label="Scan" onPress={() => {}} disabled />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
