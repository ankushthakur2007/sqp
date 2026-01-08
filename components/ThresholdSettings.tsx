
import React from 'react';
import { Thresholds } from '../types';

interface ThresholdSettingsProps {
  thresholds: Thresholds;
  onThresholdsChange: (newThresholds: Thresholds) => void;
}

const RangeInput: React.FC<{
  label: string;
  id: keyof Thresholds;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (id: keyof Thresholds, value: number) => void;
}> = ({ label, id, value, min, max, step, unit, onChange }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="grid grid-cols-3 items-center gap-4">
      <label htmlFor={id} className="text-xs text-gray-800 font-semibold col-span-1">{label}</label>
      <div className="col-span-2 flex flex-col">
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(id, parseInt(e.target.value, 10))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer range-slider"
          style={{
            ['--range-progress' as any]: `${percentage}%`
          }}
        />
        <span className="text-blue-800 font-mono text-xs font-bold self-end mt-1">{value.toLocaleString()}{unit}</span>
      </div>
    </div>
  );
};


export const ThresholdSettings: React.FC<ThresholdSettingsProps> = ({ thresholds, onThresholdsChange }) => {
  const handleChange = (id: keyof Thresholds, value: number) => {
    onThresholdsChange({
      ...thresholds,
      [id]: value,
    });
  };

  return (
    <details className="w-auto bg-gray-200 rounded-md group border-2 border-gray-700">
      <summary className="text-xs font-bold text-gray-900 cursor-pointer px-3 py-1.5 list-none flex justify-between items-center hover:bg-gray-300 rounded-md transition-colors gap-2">
        <span>Adjust Thresholds</span>
        <svg className="w-3 h-3 transition-transform duration-200 group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </summary>
      <div className="p-3 mt-1 border-t-2 border-gray-700 bg-gray-100 grid md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 text-sm">Production (%)</h4>
          <RangeInput
            label="Good >="
            id="productionGood"
            value={thresholds.productionGood}
            min={80} max={100} step={1} unit="%"
            onChange={handleChange}
          />
          <RangeInput
            label="Alert <"
            id="productionAlert"
            value={thresholds.productionAlert}
            min={70} max={95} step={1} unit="%"
            onChange={handleChange}
          />
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 text-sm">Quality Score (%)</h4>
          <RangeInput
            label="Good >="
            id="qualityGood"
            value={thresholds.qualityGood}
            min={90} max={100} step={1} unit="%"
            onChange={handleChange}
          />
          <RangeInput
            label="Alert <"
            id="qualityAlert"
            value={thresholds.qualityAlert}
            min={85} max={99} step={1} unit="%"
            onChange={handleChange}
          />
        </div>
      </div>
    </details>
  );
};
