
import React from 'react';
import { DailyData, Thresholds } from '../types';
import { calculateProductionStatus, calculateQualityStatus } from '../utils';

interface SelectionSummaryProps {
  selectedDay: number;
  data: DailyData | null;
  thresholds: Thresholds;
}

export const SelectionSummary: React.FC<SelectionSummaryProps> = ({ selectedDay, data, thresholds }) => {
  const productionStatus = calculateProductionStatus(data, thresholds);
  const qualityStatus = calculateQualityStatus(data, thresholds);

  const statusInfo = {
    good: { text: 'Good', color: 'bg-green-600', textColor: 'text-green-300' },
    warning: { text: 'Warning', color: 'bg-yellow-500', textColor: 'text-yellow-300' },
    alert: { text: 'Alert', color: 'bg-red-600', textColor: 'text-red-300' },
    default: { text: 'No Data', color: 'bg-gray-500', textColor: 'text-gray-300' },
  };

  const currentProductionStatus = statusInfo[productionStatus];
  const currentQualityStatus = statusInfo[qualityStatus];

  return (
    <div className="w-full p-4 bg-gray-800 rounded-lg shadow-xl border-2 border-gray-900 animate-fade-in-down">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="text-xl font-bold text-white">
          Summary for Day {selectedDay}
        </h3>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700 p-4 rounded-md border-2 border-gray-900">
            <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-300 font-semibold">Production</p>
                <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold ${currentProductionStatus.color}/20 ${currentProductionStatus.textColor}`}>
                    <span className={`w-2 h-2 rounded-full ${currentProductionStatus.color}`}></span>
                    <span>{currentProductionStatus.text}</span>
                </div>
            </div>
            <p className="text-3xl font-bold text-white text-center pt-2">
                {data?.production?.toLocaleString() ?? <span className="text-gray-400">N/A</span>}
            </p>
        </div>
        <div className="bg-gray-700 p-4 rounded-md border-2 border-gray-900">
             <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-300 font-semibold">Quality</p>
                 <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold ${currentQualityStatus.color}/20 ${currentQualityStatus.textColor}`}>
                    <span className={`w-2 h-2 rounded-full ${currentQualityStatus.color}`}></span>
                    <span>{currentQualityStatus.text}</span>
                </div>
            </div>
            <p className="text-3xl font-bold text-white text-center pt-2">
                {data?.quality !== null && data?.quality !== undefined ? `${data.quality}%` : <span className="text-gray-400">N/A</span>}
            </p>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};
