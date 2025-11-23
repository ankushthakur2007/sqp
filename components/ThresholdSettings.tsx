
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
}> = ({ label, id, value, min, max, step, unit, onChange }) => (
  <div className="grid grid-cols-3 items-center gap-4">
    <label htmlFor={id} className="text-sm text-gray-300 col-span-1">{label}</label>
    <div className="col-span-2 flex flex-col">
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(id, parseInt(e.target.value, 10))}
          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <span className="text-cyan-400 font-mono text-sm self-end mt-1">{value.toLocaleString()}{unit}</span>
    </div>
  </div>
);


export const ThresholdSettings: React.FC<ThresholdSettingsProps> = ({ thresholds, onThresholdsChange }) => {
  const handleChange = (id: keyof Thresholds, value: number) => {
    onThresholdsChange({
      ...thresholds,
      [id]: value,
    });
  };

  return (
    <details className="w-full bg-gray-800/40 rounded-lg group">
      <summary className="text-sm font-medium text-gray-300 cursor-pointer p-2 list-none flex justify-between items-center hover:bg-gray-700/50 rounded-md transition-colors">
        <span>Adjust Thresholds</span>
        <svg className="w-5 h-5 transition-transform duration-200 group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </summary>
      <div className="p-3 mt-1 border-t border-gray-700 grid md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-3">
              <h4 className="font-semibold text-cyan-400">Production (Units)</h4>
              <RangeInput 
                label="Good >="
                id="productionGood"
                value={thresholds.productionGood}
                min={1000} max={10000} step={100} unit=""
                onChange={handleChange}
              />
               <RangeInput 
                label="Alert <"
                id="productionAlert"
                value={thresholds.productionAlert}
                min={500} max={5000} step={100} unit=""
                onChange={handleChange}
              />
          </div>
           <div className="space-y-3">
              <h4 className="font-semibold text-cyan-400">Quality Score (%)</h4>
               <RangeInput 
                label="Good >="
                id="qualityGood"
                value={thresholds.qualityGood}
                min={80} max={100} step={1} unit="%"
                onChange={handleChange}
              />
               <RangeInput 
                label="Alert <"
                id="qualityAlert"
                value={thresholds.qualityAlert}
                min={70} max={90} step={1} unit="%"
                onChange={handleChange}
              />
          </div>
      </div>
    </details>
  );
};
