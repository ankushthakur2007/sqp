
import React, { useRef, useEffect, useState } from 'react';
import { DailyData, Letter, DataStatus, Thresholds, SafetyStatus } from '../types';
import { calculateProductionStatus, calculateQualityStatus } from '../utils';
import { SafetyCrossCalendar } from './SafetyCrossCalendar';

interface LetterDisplayProps {
  letter: Letter;
  data: Record<number, DailyData>;
  onDaySelect: (day: number) => void;
  selectedDay: number | null;
  daysInMonth: number;
  thresholds: Thresholds;
}

interface DotPosition {
  x: number;
  y: number;
}

export const LetterDisplay: React.FC<LetterDisplayProps> = ({
  letter,
  data,
  onDaySelect,
  selectedDay,
  daysInMonth,
  thresholds
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dotPositions, setDotPositions] = useState<DotPosition[]>([]);

  // Define paths and dot counts for each letter
  const letterConfig = {
    S: {
      fillPath: "M 140 80 C 60 40, 60 180, 140 160 C 220 140, 220 260, 140 240",
      dotPath: "M 140 80 C 60 40, 60 180, 140 160 C 220 140, 220 260, 140 240",
      count: Math.min(32, daysInMonth),
      className: "s-letter-path",
      title: "SAFETY"
    },
    Q: {
      fillPath: "M 140 45 C 55 45, 15 95, 15 175 C 15 255, 55 305, 140 305 C 225 305, 265 255, 265 175 C 265 95, 225 45, 140 45 M 140 85 C 200 85, 230 120, 230 175 C 230 230, 200 265, 140 265 C 80 265, 50 230, 50 175 C 50 120, 80 85, 140 85 M 195 235 L 200 255 L 235 310 L 260 295 L 220 235 Z",
      dotPath: "M 140 60 C 215 60, 250 100, 250 175 C 250 250, 215 290, 140 290 C 65 290, 30 250, 30 175 C 30 100, 65 60, 140 60",
      count: daysInMonth,
      className: "q-letter-path",
      title: "QUALITY"
    },
    P: {
      fillPath: "M 40 320 L 40 45 L 210 45 C 275 45, 300 75, 300 145 C 300 215, 275 245, 210 245 L 95 245 L 95 320 Z M 95 85 L 95 205 L 210 205 C 245 205, 270 185, 270 145 C 270 105, 245 85, 210 85 Z",
      dotPath: "M 60 310 L 60 65 L 210 65 C 262 65, 285 88, 285 145 C 285 202, 262 225, 210 225 L 85 225 L 85 310",
      count: daysInMonth,
      className: "p-letter-path",
      title: "PRODUCTION"
    }
  };

  const config = letterConfig[letter];

  // Calculate dot positions along the SVG path
  useEffect(() => {
    if (!svgRef.current) return;

    const pathElement = svgRef.current.querySelector('.dot-path') as SVGPathElement;
    if (!pathElement) return;

    const length = pathElement.getTotalLength();
    const positions: DotPosition[] = [];
    const actualCount = Math.min(config.count, daysInMonth);

    for (let i = 0; i < actualCount; i++) {
      // Distribute evenly along the entire path
      const distance = (length * (i + 0.5)) / actualCount;
      const point = pathElement.getPointAtLength(distance);
      positions.push({ x: point.x, y: point.y });
    }

    setDotPositions(positions);
  }, [config.count]);

  // Get status for a day - INDEPENDENT thresholds for each letter
  const getStatus = (day: number): DataStatus | SafetyStatus | 'no-data' => {
    const dayData = data[day];
    if (!dayData) return 'no-data';

    // S letter: Use Safety status
    if (letter === 'S') {
      return dayData.safetyStatus || 'no-data';
    }

    // P letter: Use Production percentage thresholds
    if (letter === 'P') {
      if (dayData.production === null || dayData.production === undefined) {
        return 'no-data';
      }
      const production = dayData.production;
      if (production >= thresholds.productionGood) return 'good';
      if (production < thresholds.productionAlert) return 'alert';
      return 'warning';
    }

    // Q letter: Use Quality percentage thresholds
    if (letter === 'Q' || letter === 'O') {
      if (dayData.quality === null || dayData.quality === undefined) {
        return 'no-data';
      }
      const quality = dayData.quality;
      if (quality >= thresholds.qualityGood) return 'good';
      if (quality < thresholds.qualityAlert) return 'alert';
      return 'warning';
    }

    return 'no-data';
  };

  const handleDotClick = (day: number) => {
    onDaySelect(day);
  };

  // Use calendar grid for Safety
  if (letter === 'S') {
    return (
      <SafetyCrossCalendar
        daysInMonth={daysInMonth}
        data={data}
        onDaySelect={onDaySelect}
        selectedDay={selectedDay}
      />
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl w-full flex flex-col border-2 border-gray-900 hover:shadow-2xl transition-shadow">
      <h2 className="text-center text-lg font-bold tracking-wider pb-2 mb-3"
        style={{
          color: '#ffffff',
          borderBottom: '3px solid',
          borderColor: letter === 'S' ? '#64748b' : letter === 'Q' || letter === 'O' ? '#15803d' : '#1e40af'
        }}>
        {config.title}
      </h2>
      <div className="w-full flex items-center justify-center" style={{ height: '400px' }}>
        <svg ref={svgRef} viewBox="0 20 300 320" className="w-full h-full max-h-[450px]" preserveAspectRatio="xMidYMid meet">
          {/* Filled letter shape */}
          <path
            className={`letter-path ${config.className}`}
            d={config.fillPath}
          />

          {/* Invisible path for dot positioning */}
          <path
            className="dot-path"
            d={config.dotPath}
            fill="none"
            stroke="none"
          />

          {/* Dots along the path */}
          {dotPositions.map((pos, index) => {
            const day = index + 1;
            if (day > daysInMonth) return null;

            const dayData = data[day];
            const status = getStatus(day);
            const isSelected = selectedDay === day;

            let dotClass = 'dot';

            // Show colors based on status calculation
            if (status === 'good') dotClass += ' dot-good';
            else if (status === 'warning') dotClass += ' dot-warning';
            else if (status === 'alert') dotClass += ' dot-alert';
            else if (status === 'safe') dotClass += ' dot-safe';
            else if (status === 'recordable') dotClass += ' dot-recordable';
            else if (status === 'lost-time') dotClass += ' dot-lost-time';
            else dotClass += ' dot-no-data';

            if (isSelected) dotClass += ' dot-selected';

            // Create tooltip content
            const tooltipContent = dayData
              ? `Day ${day}\nSafety: ${dayData.safetyStatus || 'N/A'}\nProduction: ${dayData.production !== null ? dayData.production.toLocaleString() : 'N/A'}\nQuality: ${dayData.quality !== null ? dayData.quality + '%' : 'N/A'}`
              : `Day ${day}\nNo data recorded`;

            return (
              <g
                key={day}
                className={dotClass}
                onClick={() => handleDotClick(day)}
                style={{ cursor: 'pointer' }}
              >
                <title>{tooltipContent}</title>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={12}
                  className="dot-circle"
                />
                <text
                  x={pos.x}
                  y={pos.y + 0.5}
                  className="dot-number"
                >
                  {day.toString().padStart(2, '0')}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
