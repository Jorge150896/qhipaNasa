export interface NasaHistoryData {
  mission: string;
  study: string;
  source: string;
  download: string;
  sampleCount: number;
  points: readonly { phase: string; glucose: number; sodium: number; potassium: number }[];
}

export type NasaIndicator = 'glucose' | 'sodium' | 'potassium';

interface IndicatorOption {
  id: NasaIndicator;
  label: string;
  unit: string;
  icon: 'activity' | 'chart' | 'orbit';
}

interface TimelineSample {
  phase: string;
  relativeDay: string;
  value: string;
  height: number;
}

export interface NasaHistoryPanelProps {
  data: Pick<NasaHistoryData, 'mission' | 'study' | 'source' | 'download' | 'sampleCount'> & {
    indicators: readonly IndicatorOption[];
    indicator: IndicatorOption;
    ceiling: string;
    selectedSample?: TimelineSample;
    groups: { label: string; samples: TimelineSample[] }[];
    rows: { phase: string; values: string[] }[];
  };
  onSelectIndicator(id: NasaIndicator): void;
  onSelectPhase(phase: string): void;
}
