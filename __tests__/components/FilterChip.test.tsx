import React from 'react';
import renderer from 'react-test-renderer';
import { FilterChip } from '../../components/FilterChip';

describe('FilterChip', () => {
  it('renders active state', () => {
    const tree = renderer
      .create(<FilterChip label="All" active={true} onPress={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders inactive state', () => {
    const tree = renderer
      .create(<FilterChip label="Labs" active={false} onPress={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
