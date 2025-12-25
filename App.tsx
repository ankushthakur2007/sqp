
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { DailyData, Thresholds, BeforeInstallPromptEvent } from './types';
import { LetterDisplay } from './components/LetterDisplay';
import { DataEntryModal } from './components/DataEntryModal';
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from './components/icons';
import { ThresholdSettings } from './components/ThresholdSettings';
import { SelectionSummary } from './components/SelectionSummary';


const StatusLegend: React.FC = () => (
  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-600" role="legend">
    <div className="flex items-center gap-2" title="Metric is at or above the 'Good' threshold">
      <span className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-800"></span>
      <span>Good</span>
    </div>
    <div className="flex items-center gap-2" title="Metric is between 'Good' and 'Alert' thresholds">
      <span className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-yellow-800"></span>
      <span>Warning</span>
    </div>
    <div className="flex items-center gap-2" title="Metric is below the 'Alert' threshold">
      <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-900"></span>
      <span>Alert</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full bg-white border-2 border-gray-400"></span>
      <span className="text-gray-500">No Data</span>
    </div>
  </div>
);


import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyData, setDailyData] = useState<Record<number, DailyData>>({});
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [thresholds, setThresholds] = useState<Thresholds>(() => {
    const savedThresholds = localStorage.getItem('pq-tracker-thresholds');
    if (savedThresholds) {
      return JSON.parse(savedThresholds);
    }
    return {
      productionGood: 4000,
      productionAlert: 1000,
      qualityGood: 95,
      qualityAlert: 85,
    };
  });
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  const fetchMonthData = useCallback(async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      console.error('Error fetching data:', error);
      return;
    }

    const newDailyData: Record<number, DailyData> = {};
    data?.forEach((entry: any) => {
      const day = new Date(entry.date).getDate();
      newDailyData[day] = {
        production: entry.production,
        quality: entry.quality,
        safetyStatus: entry.safety_status as any
      };
    });
    setDailyData(newDailyData);
  }, [currentDate]);

  useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData]);

  // Save thresholds to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('pq-tracker-thresholds', JSON.stringify(thresholds));
    } catch (error) {
      console.error("Failed to save thresholds to local storage:", error);
    }
  }, [thresholds]);

  const daysInMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  }, [currentDate]);

  const monthName = useMemo(() => {
    return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  const handleDaySelect = useCallback((day: number) => {
    setSelectedDay(day);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedDay(null);
  }, []);

  const handleSaveData = useCallback(async (day: number, data: DailyData) => {
    // Optimistic update
    setDailyData(prevData => {
      const newData = { ...prevData, [day]: data };
      if (data.production === null && data.quality === null && data.safetyStatus === undefined) {
        delete newData[day];
      }
      return newData;
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    // Create date string in YYYY-MM-DD format, ensuring local time is respected for the day
    const dateObj = new Date(year, month, day);
    // Adjust for timezone offset to ensure the date string is correct for the user's locale
    const offset = dateObj.getTimezoneOffset();
    const localDate = new Date(dateObj.getTime() - (offset * 60 * 1000));
    const dateStr = localDate.toISOString().split('T')[0];

    const { error } = await supabase
      .from('daily_entries')
      .upsert({
        date: dateStr,
        production: data.production,
        quality: data.quality,
        safety_status: data.safetyStatus
      }, { onConflict: 'date' });

    if (error) {
      console.error('Error saving data:', error);
      // Revert optimistic update? For now just log error.
    }

    // Show save confirmation
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setShowSaveConfirmation(true);
    saveTimeoutRef.current = window.setTimeout(() => {
      setShowSaveConfirmation(false);
    }, 2500);

  }, [currentDate]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(1); // avoid issues with months having different numbers of days
      const newMonth = direction === 'prev' ? prevDate.getMonth() - 1 : prevDate.getMonth() + 1;
      newDate.setMonth(newMonth);
      return newDate;
    });
    setSelectedDay(null);
  };

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 sm:p-6 flex flex-col items-center">
      <header className="w-full max-w-screen-xl text-center mb-6">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            SQP Daily Tracker
          </h1>
          {installPrompt && !isStandalone && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 whitespace-nowrap text-sm"
              title="Install App"
            >
              <DownloadIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}
        </div>
        <p className="text-gray-600 mt-2 text-sm">Visualize Safety, Quality & Production Metrics</p>
      </header >

      <div className="w-full max-w-screen-xl mx-auto mb-4 px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 bg-gray-100 rounded-lg p-3">
          <div className="flex items-center justify-center">
            <button
              onClick={() => handleMonthChange('prev')}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 w-48 text-center">{monthName}</h2>
            <button
              onClick={() => handleMonthChange('next')}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Next month"
            >
              <ChevronRightIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          <div className="flex">
            <StatusLegend />
          </div>
        </div>
      </div>

      <div className="w-full max-w-screen-xl mx-auto px-4 flex-1 flex flex-col">
        {selectedDay && (
          <div className="mb-4">
            <SelectionSummary
              selectedDay={selectedDay}
              data={dailyData[selectedDay] || null}
              thresholds={thresholds}
            />
          </div>
        )}

        {/* SQP Letters Container */}
        <main className="w-full flex-1 flex justify-center items-start py-4">
          <div className="grid grid-cols-3 gap-6 w-full max-w-[1400px] px-4">
            <LetterDisplay
              letter="S"
              data={dailyData}
              onDaySelect={handleDaySelect}
              selectedDay={selectedDay}
              daysInMonth={daysInMonth}
              thresholds={thresholds}
            />
            <LetterDisplay
              letter="Q"
              data={dailyData}
              onDaySelect={handleDaySelect}
              selectedDay={selectedDay}
              daysInMonth={daysInMonth}
              thresholds={thresholds}
            />
            <LetterDisplay
              letter="P"
              data={dailyData}
              onDaySelect={handleDaySelect}
              selectedDay={selectedDay}
              daysInMonth={daysInMonth}
              thresholds={thresholds}
            />
          </div>
        </main>
      </div>

      <DataEntryModal
        isOpen={selectedDay !== null}
        onClose={handleCloseModal}
        onSave={handleSaveData}
        day={selectedDay}
        data={selectedDay ? dailyData[selectedDay] || { production: null, quality: null } : null}
      />

      <footer className="w-full mt-auto pt-6 text-gray-500 text-sm">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center px-4">
          <p>SQP Tracker by AI Studio</p>
          <div className="flex items-center gap-4">
            {showSaveConfirmation && (
              <span className="text-green-600 animate-fade-in-out">
                ✓ Data Saved to Device
              </span>
            )}
            <p>Click on a date to log data.</p>
          </div>
        </div>
      </footer>
      <style>{`
        @keyframes fade-in-out {
            0% { opacity: 0; transform: translateY(5px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(5px); }
        }
        .animate-fade-in-out {
            animation: fade-in-out 2.5s ease-in-out forwards;
        }
      `}</style>
    </div >
  );
};

export default App;
