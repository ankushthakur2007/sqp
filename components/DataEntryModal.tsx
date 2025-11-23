
import React, { useState, useEffect } from 'react';
import { DailyData, SafetyStatus } from '../types';
import { CloseIcon } from './icons';

interface DataEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (day: number, data: DailyData) => void;
  day: number | null;
  data: DailyData | null;
}

const RadioOption: React.FC<{
  id: string, value: SafetyStatus, checked: boolean, onChange: (value: SafetyStatus) => void, label: string, color: 'green' | 'yellow' | 'red'
}> = ({ id, value, checked, onChange, label, color }) => {
  const checkedClasses = {
    green: 'bg-green-600 text-white',
    yellow: 'bg-yellow-500 text-white',
    red: 'bg-red-600 text-white',
  };
  return (
    <label htmlFor={id} className={`flex-1 text-center text-sm font-semibold px-4 py-2 rounded-md cursor-pointer transition-colors duration-200 ${checked ? checkedClasses[color] : 'text-gray-300 hover:bg-gray-600'}`}>
      <input type="radio" id={id} name="safetyStatus" value={value} checked={checked} onChange={() => onChange(value)} className="sr-only" />
      {label}
    </label>
  );
};

export const DataEntryModal: React.FC<DataEntryModalProps> = ({ isOpen, onClose, onSave, day, data }) => {
  const [production, setProduction] = useState<string>('');
  const [quality, setQuality] = useState<string>('');
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus | undefined>(undefined);

  useEffect(() => {
    if (data && day) {
      setProduction(data.production?.toString() || '');
      setQuality(data.quality?.toString() || '');
      setSafetyStatus(data.safetyStatus);
    } else {
      setProduction('');
      setQuality('');
      setSafetyStatus(undefined);
    }
  }, [data, day]);

  const handleSave = () => {
    if (day) {
      onSave(day, {
        production: production ? parseInt(production, 10) : null,
        quality: quality ? parseInt(quality, 10) : null,
        safetyStatus: safetyStatus,
      });
      onClose();
    }
  };
  
  const handleClear = () => {
      setProduction('');
      setQuality('');
      setSafetyStatus(undefined);
  };

  if (!isOpen || !day) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md m-4 relative transform transition-all duration-300 scale-95 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <CloseIcon />
        </button>
        <h3 className="text-2xl font-bold text-cyan-400 mb-2">Data for Day {day}</h3>
        <p className="text-gray-400 mb-6">Enter the Production and Quality metrics.</p>

        <div className="space-y-6">
          <div>
            <label htmlFor="production" className="block text-sm font-medium text-gray-300 mb-2">Production (Units)</label>
            <input
              type="number"
              id="production"
              value={production}
              onChange={(e) => setProduction(e.target.value)}
              placeholder="e.g., 5000"
              className="w-full bg-gray-700 border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>
          <div>
            <label htmlFor="quality" className="block text-sm font-medium text-gray-300 mb-2">Quality Score (1-100)</label>
            <input
              type="number"
              id="quality"
              min="1"
              max="100"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              placeholder="e.g., 98"
              className="w-full bg-gray-700 border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Safety Status</label>
            <div className="flex justify-around bg-gray-700 rounded-lg p-1">
                <RadioOption id="safe" value="safe" checked={safetyStatus === 'safe'} onChange={setSafetyStatus} label="Safe" color="green" />
                <RadioOption id="recordable" value="recordable" checked={safetyStatus === 'recordable'} onChange={setSafetyStatus} label="Recordable" color="yellow" />
                <RadioOption id="lost-time" value="lost-time" checked={safetyStatus === 'lost-time'} onChange={setSafetyStatus} label="Lost Time" color="red" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
            <button
                onClick={handleClear}
                className="px-6 py-2 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
                Clear
            </button>
            <button
                onClick={handleSave}
                className="px-6 py-2 rounded-md text-white font-semibold bg-cyan-600 hover:bg-cyan-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
            >
                Save Data
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};