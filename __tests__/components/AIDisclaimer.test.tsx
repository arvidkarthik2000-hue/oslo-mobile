import React from 'react';
import renderer from 'react-test-renderer';
import { AIDisclaimer } from '../../components/AIDisclaimer';

describe('AIDisclaimer', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<AIDisclaimer />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
