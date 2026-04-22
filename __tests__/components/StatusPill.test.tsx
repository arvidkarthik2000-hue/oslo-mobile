import React from 'react';
import renderer from 'react-test-renderer';
import { StatusPill } from '../../components/StatusPill';

describe('StatusPill', () => {
  it('renders ok pill', () => {
    const tree = renderer.create(<StatusPill status="ok" text="Normal" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders watch pill', () => {
    const tree = renderer.create(<StatusPill status="watch" text="Borderline" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders flag pill', () => {
    const tree = renderer.create(<StatusPill status="flag" text="High" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
