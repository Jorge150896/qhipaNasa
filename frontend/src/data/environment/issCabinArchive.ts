import type { CabinArchive } from '@/domain/environmentArchive';
import rows from './iss-rr9-2018-08-20.json';

export const issCabinArchive: CabinArchive = {
  seriesDate: '20 ago. 2018',
  sourceUrl: 'https://visualization.osdr.nasa.gov/eda/',
  samples: rows.map(([time, co2, airTemperature, relativeHumidity]) => ({
    time: String(time),
    co2: Number(co2),
    airTemperature: Number(airTemperature),
    relativeHumidity: Number(relativeHumidity),
  })),
};
