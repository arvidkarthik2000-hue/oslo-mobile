import React from 'react';
import { Text } from 'react-native';
import renderer from 'react-test-renderer';
import { CategoryRow } from '../../components/CategoryRow';

describe('CategoryRow', () => {
  it('renders title only', () => {
    const tree = renderer.create(<CategoryRow title="Lab Reports" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with subtitle, count, and icon', () => {
    const tree = renderer
      .create(
        <CategoryRow
          icon={<Text>🧪</Text>}
          title="Lab Reports"
          subtitle="Last: 12 Apr 2026"
          count={14}
          onPress={() => {}}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
