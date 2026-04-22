import React from 'react';
import { Text } from 'react-native';
import renderer from 'react-test-renderer';
import { TabBar } from '../../components/TabBar';

describe('TabBar', () => {
  const tabs = [
    { key: 'home', label: 'Home', icon: <Text>🏠</Text> },
    { key: 'timeline', label: 'Timeline', icon: <Text>📅</Text> },
    { key: 'records', label: 'Records', icon: <Text>📋</Text> },
  ];

  it('renders with home active', () => {
    const tree = renderer
      .create(<TabBar tabs={tabs} active="home" onChange={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with records active', () => {
    const tree = renderer
      .create(<TabBar tabs={tabs} active="records" onChange={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
