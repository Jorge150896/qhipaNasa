export interface CabinSample {
  time: string;
  co2: number;
  airTemperature: number;
  relativeHumidity: number;
}

export interface CabinArchive {
  seriesDate: string;
  sourceUrl: string;
  samples: readonly CabinSample[];
}
