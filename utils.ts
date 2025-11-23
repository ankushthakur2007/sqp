import { DailyData, DataStatus, Thresholds } from './types';

export const calculateProductionStatus = (data: DailyData | undefined | null, thresholds: Thresholds): DataStatus => {
  if (data?.production === null || data?.production === undefined) {
    return 'default';
  }
  const { production } = data;
  const { productionGood, productionAlert } = thresholds;

  if (production < productionAlert) return 'alert';
  if (production >= productionGood) return 'good';
  return 'warning';
};

export const calculateQualityStatus = (data: DailyData | undefined | null, thresholds: Thresholds): DataStatus => {
  if (data?.quality === null || data?.quality === undefined) {
    return 'default';
  }
  const { quality } = data;
  const { qualityGood, qualityAlert } = thresholds;

  if (quality < qualityAlert) return 'alert';
  if (quality >= qualityGood) return 'good';
  return 'warning';
};
