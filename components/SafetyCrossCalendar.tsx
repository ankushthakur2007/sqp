
import React from 'react';
import { DailyData, SafetyStatus } from '../types';

interface SafetyCrossCalendarProps {
  daysInMonth: number;
  data: Record<number, DailyData>;
  onDaySelect: (day: number) => void;
  selectedDay: number | null;
}

// Defines the position of each day in a 7-column grid to form a cross shape.
const DAY_COORDINATES: { [day: number]: { row: number, col: number } } = {
  1: { row: 1, col: 3 }, 2: { row: 1, col: 4 }, 3: { row: 1, col: 5 },
  4: { row: 2, col: 3 }, 5: { row: 2, col: 4 }, 6: { row: 2, col: 5 },
  7: { row: 3, col: 1 }, 8: { row: 3, col: 2 }, 9: { row: 3, col: 3 }, 10: { row: 3, col: 4 }, 11: { row: 3, col: 5 }, 12: { row: 3, col: 6 }, 13: { row: 3, col: 7 },
  14: { row: 4, col: 1 }, 15: { row: 4, col: 2 }, 16: { row: 4, col: 3 }, 17: { row: 4, col: 4 }, 18: { row: 4, col: 5 }, 19: { row: 4, col: 6 }, 20: { row: 4, col: 7 },
  21: { row: 5, col: 3 }, 22: { row: 5, col: 4 }, 23: { row: 5, col: 5 },
  24: { row: 6, col: 3 }, 25: { row: 6, col: 4 }, 26: { row: 6, col: 5 },
  27: { row: 7, col: 3 }, 28: { row: 7, col: 4 }, 29: { row: 7, col: 5 },
  30: { row: 8, col: 3 }, 31: { row: 8, col: 4 },
};

type CellStatus = SafetyStatus | 'no-data';

const DayCell: React.FC<{
    day: number;
    dayData: DailyData | undefined;
    onClick: () => void;
    isSelected: boolean;
    coords: { row: number, col: number };
}> = ({ day, dayData, onClick, isSelected, coords }) => {
    
    const getStatus = (): CellStatus => {
        if (!dayData) {
            return 'no-data';
        }
        // If data exists, but no status is set, default to 'safe'
        return dayData.safetyStatus || 'safe';
    }

    const status = getStatus();

    const statusClasses: Record<CellStatus, string> = {
      'safe': 'bg-green-600 text-white hover:bg-green-500 focus:ring-green-400',
      'recordable': 'bg-yellow-500 text-white hover:bg-yellow-400 focus:ring-yellow-400',
      'lost-time': 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-400',
      'no-data': 'bg-white text-black hover:bg-gray-200 focus:ring-cyan-500',
    };
    
    const cellClasses = `w-full aspect-square flex items-center justify-center rounded-md text-sm font-bold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-300 ${statusClasses[status]}`;
    
    const selectedClasses = isSelected ? "ring-2 ring-offset-2 ring-offset-slate-300 ring-cyan-400 scale-110" : "";

    return (
        <button 
            onClick={onClick} 
            className={`${cellClasses} ${selectedClasses}`}
            style={{ gridRowStart: coords.row, gridColumnStart: coords.col }}
            aria-label={`Day ${day}`}
        >
            {day}
        </button>
    );
};

export const SafetyCrossCalendar: React.FC<SafetyCrossCalendarProps> = ({ daysInMonth, data, onDaySelect, selectedDay }) => {
    return (
        <div className="bg-slate-300 rounded-xl p-4 shadow-lg w-full h-full flex flex-col">
            <h2 className="text-center text-xl font-bold tracking-wider text-gray-800 border-b-2 border-gray-400 pb-2 mb-4">SAFETY</h2>
            <div className="grid grid-cols-7 grid-rows-8 gap-1.5 sm:gap-2 flex-1">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                    if (day > daysInMonth) return null;
                    const coords = DAY_COORDINATES[day];
                    if (!coords) return null;
                    
                    return (
                        <DayCell 
                            key={day}
                            day={day}
                            dayData={data[day]}
                            onClick={() => onDaySelect(day)}
                            isSelected={selectedDay === day}
                            coords={coords}
                        />
                    );
                })}
            </div>
        </div>
    );
};
