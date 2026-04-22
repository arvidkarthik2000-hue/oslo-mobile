import React from 'react';
import renderer from 'react-test-renderer';
import { StatusDot } from '../../components/StatusDot';

describe('StatusDot', () => {
  it('renders ok status', () => {
    const tree = renderer.create(<StatusDot status="ok" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders watch status', () => {
    const tree = renderer.create(<StatusDot status="watch" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders flag status', () => {
    const tree = renderer.create(<StatusDot status="flag" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
