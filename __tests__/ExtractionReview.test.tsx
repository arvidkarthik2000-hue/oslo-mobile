import React from 'react';
import renderer from 'react-test-renderer';
import { ExtractionReview } from '../components/ExtractionReview';
import type { LabTest } from '../store/documents';

const mockTests: LabTest[] = [
  {
    test_name: 'Hemoglobin',
    loinc_code: '718-7',
    value_num: 14.2,
    unit: 'g/dL',
    ref_low: 13.0,
    ref_high: 17.5,
    flag: 'ok',
  },
  {
    test_name: 'Fasting Glucose',
    loinc_code: '1558-6',
    value_num: 126,
    unit: 'mg/dL',
    ref_low: 70,
    ref_high: 100,
    flag: 'watch',
  },
];

describe('ExtractionReview', () => {
  it('renders lab values table', () => {
    const tree = renderer
      .create(
        <ExtractionReview
          tests={mockTests}
          onConfirm={() => {}}
          onCancel={() => {}}
          documentClass="lab_report"
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
