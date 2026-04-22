import React from 'react';
import renderer from 'react-test-renderer';
import { CriticalValueBanner } from '../components/CriticalValueBanner';

describe('CriticalValueBanner', () => {
  it('renders with flags', () => {
    const tree = renderer
      .create(
        <CriticalValueBanner
          flags={['Hemoglobin 10.2 g/dL — below typical range', 'HbA1c 7.8% — above typical range']}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders nothing with empty flags', () => {
    const tree = renderer
      .create(<CriticalValueBanner flags={[]} />)
      .toJSON();
    expect(tree).toBeNull();
  });
});
