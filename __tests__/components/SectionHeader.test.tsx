import React from 'react';
import renderer from 'react-test-renderer';
import { SectionHeader } from '../../components/SectionHeader';

describe('SectionHeader', () => {
  it('renders text only', () => {
    const tree = renderer.create(<SectionHeader text="Recent" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with action button', () => {
    const tree = renderer
      .create(<SectionHeader text="Lab Results" action="See all" onAction={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
