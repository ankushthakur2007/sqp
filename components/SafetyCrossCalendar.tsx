
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
  30: { row: 8, col: 3 }, 31: { row: 8, col: 5 },
};

// Get blank box positions for symmetry based on days in month
const getBlankPositions = (daysInMonth: number): Array<{ row: number, col: number }> => {
  if (daysInMonth === 31) {
    return [{ row: 8, col: 4 }]; // 30 - blank - 31
  } else if (daysInMonth === 30) {
    return [{ row: 8, col: 4 }, { row: 8, col: 5 }]; // 30 in col 3, blanks in 4 & 5
  } else if (daysInMonth === 29) {
    return [{ row: 8, col: 3 }, { row: 8, col: 4 }, { row: 8, col: 5 }]; // All blank row 8
  } else { // 28 days
    return [{ row: 7, col: 5 }, { row: 8, col: 3 }, { row: 8, col: 4 }, { row: 8, col: 5 }]; // blank after 28 + all blank row 8
  }
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

    // Create tooltip content
    const tooltipContent = dayData 
      ? `Day ${day}\nSafety: ${dayData.safetyStatus || 'N/A'}\nProduction: ${dayData.production !== null ? dayData.production.toLocaleString() : 'N/A'}\nQuality: ${dayData.quality !== null ? dayData.quality + '%' : 'N/A'}`
      : `Day ${day}\nNo data recorded`;

    const statusClasses: Record<CellStatus, string> = {
      'safe': 'bg-green-700 text-white hover:bg-green-600 focus:ring-green-500 border-2 border-green-900',
      'recordable': 'bg-yellow-500 text-gray-900 hover:bg-yellow-400 focus:ring-yellow-500 border-2 border-yellow-700',
      'lost-time': 'bg-red-700 text-white hover:bg-red-600 focus:ring-red-500 border-2 border-red-900',
      'no-data': 'bg-gray-400 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 border-2 border-gray-600',
    };
    
    const cellClasses = `w-full aspect-square flex items-center justify-center rounded-md text-base font-extrabold transition-all duration-200 transform hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${statusClasses[status]}`;
    
    const selectedClasses = isSelected ? "ring-4 ring-offset-2 ring-offset-gray-800 ring-blue-500 scale-110" : "";

    return (
        <button 
            onClick={onClick} 
            className={`${cellClasses} ${selectedClasses}`}
            style={{ gridRowStart: coords.row, gridColumnStart: coords.col }}
            aria-label={`Day ${day}`}
            title={tooltipContent}
        >
            {day}
        </button>
    );
};

export const SafetyCrossCalendar: React.FC<SafetyCrossCalendarProps> = ({ daysInMonth, data, onDaySelect, selectedDay }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl w-full h-full flex flex-col border-2 border-gray-900">
            <h2 className="text-center text-lg font-bold tracking-wider text-white border-b-3 border-gray-600 pb-2 mb-4">SAFETY</h2>
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
                {/* Blank boxes for symmetry */}
                {getBlankPositions(daysInMonth).map((pos, index) => (
                    <div 
                        key={`blank-${pos.row}-${pos.col}`}
                        className="w-full aspect-square flex items-center justify-center rounded-md text-base font-extrabold transition-all duration-200 bg-gray-400 text-gray-800 border-2 border-gray-600"
                        style={{ gridRowStart: pos.row, gridColumnStart: pos.col }}
                        aria-hidden="true"
                    />
                ))}
            </div>
        </div>
    );
};
