
import React from 'react';
import { DailyData, Letter, DataStatus, Thresholds } from '../types';
import { ALL_P_COORDS, ALL_Q_COORDS, ALL_S_COORDS, ALL_O_COORDS } from '../constants';
import { calculateProductionStatus, calculateQualityStatus } from '../utils';

interface LetterDisplayProps {
  letter: Letter;
  data: Record<number, DailyData>;
  onDaySelect: (day: number) => void;
  selectedDay: number | null;
  daysInMonth: number;
  thresholds: Thresholds;
}

const DateHole: React.FC<{
  day: number;
  status: DataStatus;
  isSelected: boolean;
  onClick: (day: number) => void;
  coords: { top: string; left: string };
}> = ({ day, status, isSelected, onClick, coords }) => {
  const baseClasses = "absolute w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";

  const statusClasses = {
    default: "bg-white text-black hover:bg-gray-200 focus:ring-cyan-500",
    good: "bg-green-600 text-white hover:bg-green-500 focus:ring-green-400 shadow-lg shadow-green-900/50",
    warning: "bg-yellow-500 text-white hover:bg-yellow-400 focus:ring-yellow-400 shadow-lg shadow-yellow-900/50",
    alert: "bg-red-600 text-white hover:bg-red-500 focus:ring-red-400 shadow-lg shadow-red-900/50",
  };

  let stateClasses = statusClasses[status];

  if (isSelected) {
    stateClasses = "bg-cyan-500 text-white scale-125 ring-2 ring-offset-2 ring-offset-slate-300 ring-cyan-400 shadow-xl shadow-cyan-700/50";
  }

  return (
    <button
      onClick={() => onClick(day)}
      className={`${baseClasses} ${stateClasses}`}
      style={{ top: `calc(${coords.top} - 1.375rem)`, left: `calc(${coords.left} - 1.375rem)` }}
      aria-label={`Select day ${day}`}
    >
      {day}
    </button>
  );
};

export const LetterDisplay: React.FC<LetterDisplayProps> = ({ letter, data, onDaySelect, selectedDay, daysInMonth, thresholds }) => {
  let coords;
  switch (letter) {
    case 'S': coords = ALL_S_COORDS; break;
    case 'O': coords = ALL_O_COORDS; break;
    case 'P': coords = ALL_P_COORDS; break;
    case 'Q': coords = ALL_Q_COORDS; break;
    default: coords = ALL_P_COORDS;
  }

  const letterStyles = {
    P: {
      elements: [
        <div key="p-stem" className="absolute top-0 left-[15%] w-[50%] h-full bg-blue-800 rounded-lg"></div>,
        <div key="p-bowl" className="absolute top-0 left-[15%] w-[85%] h-[55%] bg-blue-800 rounded-tr-[60px] rounded-br-[60px]"></div>,
        <div key="p-hole" className="absolute top-[15%] left-[60%] w-[30%] h-[25%] bg-slate-300 rounded-full"></div>
      ]
    },
    Q: {
      elements: [
        <div key="q-bowl" className="w-full h-full absolute top-0 left-0 bg-green-800 rounded-full"></div>,
        <div key="q-hole" className="absolute top-[25%] left-[25%] w-[50%] h-[50%] bg-slate-300 rounded-full"></div>,
        <div key="q-tail" className="absolute bottom-[6%] right-[14%] w-16 h-24 bg-green-800 -rotate-45 transform origin-bottom-right rounded-sm"></div>,
      ]
    },
    O: {
      elements: [
        <div key="o-bowl" className="w-full h-full absolute top-0 left-0 bg-green-800 rounded-full"></div>,
        <div key="o-hole" className="absolute top-[25%] left-[25%] w-[50%] h-[50%] bg-slate-300 rounded-full"></div>,
      ]
    },
    S: {
      elements: [
        <div key="s-top" className="absolute top-[5%] left-[10%] w-[80%] h-[20%] bg-teal-800 rounded-full"></div>,
        <div key="s-mid" className="absolute top-[40%] left-[10%] w-[80%] h-[20%] bg-teal-800 rounded-full transform -rotate-12"></div>,
        <div key="s-bot" className="absolute bottom-[5%] left-[10%] w-[80%] h-[20%] bg-teal-800 rounded-full"></div>,
        <div key="s-c1" className="absolute top-[15%] left-[10%] w-[20%] h-[35%] bg-teal-800 rounded-full"></div>,
        <div key="s-c2" className="absolute bottom-[15%] right-[10%] w-[20%] h-[35%] bg-teal-800 rounded-full"></div>,
      ]
    }
  };

  let title = "UNKNOWN";
  if (letter === 'P') title = "PRODUCTION";
  else if (letter === 'Q' || letter === 'O') title = "QUALITY";
  else if (letter === 'S') title = "SAFETY";

  return (
    <div className="bg-slate-300 rounded-xl p-4 shadow-lg w-full h-full flex flex-col">
      <h2 className="text-center text-xl font-bold tracking-wider text-gray-800 border-b-2 border-gray-400 pb-2 mb-4">{title}</h2>
      <div className="w-full flex-1 relative">
        {letterStyles[letter].elements}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dayData = data[day];
          let status: DataStatus = 'default';

          if (letter === 'P') {
            status = calculateProductionStatus(dayData, thresholds);
          } else if (letter === 'Q' || letter === 'O') {
            status = calculateQualityStatus(dayData, thresholds);
          } else if (letter === 'S') {
            // Safety logic
            if (!dayData) status = 'default';
            else if (dayData.safetyStatus === 'safe') status = 'good';
            else if (dayData.safetyStatus === 'recordable') status = 'warning';
            else if (dayData.safetyStatus === 'lost-time') status = 'alert';
            else status = 'default';
          }

          return (
            <DateHole
              key={day}
              day={day}
              status={status}
              isSelected={selectedDay === day}
              onClick={onDaySelect}
              coords={coords[day - 1] || { top: '0%', left: '0%' }}
            />
          )
        })}
      </div>
    </div>
  );
};
