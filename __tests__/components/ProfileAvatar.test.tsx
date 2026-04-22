import React from 'react';
import renderer from 'react-test-renderer';
import { ProfileAvatar } from '../../components/ProfileAvatar';

describe('ProfileAvatar', () => {
  it('renders size 32 correctly', () => {
    const tree = renderer.create(<ProfileAvatar size={32} initials="AK" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders size 52 with custom color', () => {
    const tree = renderer
      .create(<ProfileAvatar size={52} initials="dr" color="#BA7517" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('truncates initials to 2 chars', () => {
    const tree = renderer.create(<ProfileAvatar size={44} initials="ABCDEF" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
