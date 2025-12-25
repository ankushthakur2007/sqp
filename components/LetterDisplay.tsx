
import React, { useRef, useEffect, useState } from 'react';
import { DailyData, Letter, DataStatus, Thresholds, SafetyStatus } from '../types';
import { calculateProductionStatus, calculateQualityStatus } from '../utils';

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
      fillPath: "M 140 90 C 90 90, 60 120, 60 175 C 60 230, 90 260, 140 260 C 190 260, 220 230, 220 175 C 220 120, 190 90, 140 90 M 140 120 C 170 120, 190 140, 190 175 C 190 210, 170 230, 140 230 C 110 230, 90 210, 90 175 C 90 140, 110 120, 140 120 M 175 215 L 175 235 L 210 280 L 235 265 L 195 215 Z",
      dotPath: "M 140 90 C 190 90, 220 120, 220 175 C 220 230, 190 260, 140 260 C 90 260, 60 230, 60 175 C 60 120, 90 90, 140 90 M 175 215 L 210 280",
      count: Math.min(40, daysInMonth),
      className: "q-letter-path",
      title: "QUALITY"
    },
    O: {
      fillPath: "M 140 90 C 90 90, 60 120, 60 175 C 60 230, 90 260, 140 260 C 190 260, 220 230, 220 175 C 220 120, 190 90, 140 90 M 140 120 C 170 120, 190 140, 190 175 C 190 210, 170 230, 140 230 C 110 230, 90 210, 90 175 C 90 140, 110 120, 140 120",
      dotPath: "M 140 90 C 190 90, 220 120, 220 175 C 220 230, 190 260, 140 260 C 90 260, 60 230, 60 175 C 60 120, 90 90, 140 90",
      count: Math.min(40, daysInMonth),
      className: "q-letter-path",
      title: "QUALITY"
    },
    P: {
      fillPath: "M 90 280 L 90 90 L 160 90 C 200 90, 230 110, 230 150 C 230 190, 200 210, 160 210 L 120 210 L 120 280 Z M 120 120 L 120 180 L 160 180 C 180 180, 200 170, 200 150 C 200 130, 180 120, 160 120 Z",
      dotPath: "M 90 280 L 90 90 L 160 90 C 200 90, 230 110, 230 150 C 230 190, 200 210, 160 210 L 120 210 L 120 280",
      count: Math.min(28, daysInMonth),
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

    for (let i = 0; i < config.count; i++) {
      const point = pathElement.getPointAtLength((length / config.count) * i);
      positions.push({ x: point.x, y: point.y });
    }

    setDotPositions(positions);
  }, [config.count]);

  // Get status for a day
  const getStatus = (day: number): DataStatus | SafetyStatus | 'no-data' => {
    const dayData = data[day];
    if (!dayData) return 'no-data';

    if (letter === 'S') {
      return dayData.safetyStatus || 'safe';
    } else if (letter === 'P') {
      return calculateProductionStatus(dayData.production, thresholds);
    } else if (letter === 'Q' || letter === 'O') {
      return calculateQualityStatus(dayData.quality, thresholds);
    }
    return 'no-data';
  };

  const handleDotClick = (day: number) => {
    onDaySelect(day);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-lg w-full flex flex-col border border-gray-200 hover:shadow-xl transition-shadow">
      <h2 className="text-center text-base font-bold tracking-wider pb-2 mb-3" 
          style={{
            color: letter === 'S' ? '#1f487c' : letter === 'Q' || letter === 'O' ? '#c42727' : '#2f8e3c',
            borderBottom: '2px solid',
            borderColor: letter === 'S' ? '#1f487c' : letter === 'Q' || letter === 'O' ? '#c42727' : '#2f8e3c'
          }}>
        {config.title}
      </h2>
      <div className="w-full flex items-center justify-center" style={{ height: '250px' }}>
        <svg ref={svgRef} viewBox="0 0 280 350" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
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
            
            const status = getStatus(day);
            const isSelected = selectedDay === day;
            
            let dotClass = 'dot';
            if (status === 'good') dotClass += ' dot-good';
            else if (status === 'warning') dotClass += ' dot-warning';
            else if (status === 'alert') dotClass += ' dot-alert';
            else if (status === 'safe') dotClass += ' dot-safe';
            else if (status === 'recordable') dotClass += ' dot-recordable';
            else if (status === 'lost-time') dotClass += ' dot-lost-time';
            else dotClass += ' dot-no-data';
            
            if (isSelected) dotClass += ' dot-selected';

            return (
              <g
                key={day}
                className={dotClass}
                onClick={() => handleDotClick(day)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={14}
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
