import type { LaunchSite, LaunchSitesRepository } from '@/domain/launches/models';
import { nasaCenters } from './nasaCenters';

const sites: readonly LaunchSite[] = [
  {
    id: 'kennedy',
    name: 'Kennedy',
    fullName: 'Centro Espacial Kennedy (NASA)',
    kind: 'launch-site',
    summary:
      'Centro de NASA dedicado a preparar, integrar y lanzar misiones espaciales. El marcador corresponde a la plataforma 39B.',
    role: 'Preparación y operaciones de lanzamiento',
    facilityUrl: 'https://www.nasa.gov/kennedy/',
    region: 'Merritt Island, Florida · Estados Unidos',
    pad: 'Complejo de lanzamiento 39B',
    latitude: 28.627,
    longitude: -80.621,
    coordinateSource: 'https://www.nasa.gov/wp-content/uploads/2023/04/sp-4029.pdf',
    mission: 'Artemis I',
    launchDate: '2022-11-16',
    description:
      'El primer vuelo de SLS y Orion inició su viaje de prueba sin tripulación alrededor de la Luna.',
    videoId: 'VUiEdqcLg-k',
    videoCredit: 'NASA',
    sourceUrl: 'https://www.nasa.gov/mission/artemis-i/',
    videoLocation: 'Centro Espacial Kennedy · LC-39B, Florida',
    videoRelation: 'Artemis I despegó desde la plataforma 39B de este centro.',
    relationSourceUrl: 'https://www.nasa.gov/mission/artemis-i/',
  },
  {
    id: 'vandenberg',
    name: 'Vandenberg',
    fullName: 'Base de la Fuerza Espacial Vandenberg',
    kind: 'launch-site',
    summary:
      'Base de lanzamiento en la costa de California. El marcador identifica el complejo 3E, utilizado para la misión InSight.',
    role: 'Lanzamientos desde la costa oeste de Estados Unidos',
    facilityUrl: 'https://www.vandenberg.spaceforce.mil/',
    region: 'Condado de Santa Bárbara, California · Estados Unidos',
    pad: 'Complejo de lanzamiento 3E',
    latitude: 34.64,
    longitude: -120.59,
    coordinateSource: 'https://www.wikidata.org/wiki/Q98460228',
    mission: 'InSight',
    launchDate: '2018-05-05',
    description:
      'La misión InSight partió hacia Marte a bordo de un Atlas V, en el primer lanzamiento interplanetario desde la costa oeste de Estados Unidos.',
    videoId: 'O4_JNAFClFk',
    videoCredit: 'NASA / JPL',
    sourceUrl: 'https://science.nasa.gov/resource/nasa-launches-insight-to-mars-part-1-may-5-2018/',
    videoLocation: 'Vandenberg · SLC-3E, California',
    videoRelation: 'InSight despegó desde el complejo 3E de esta base.',
    relationSourceUrl: 'https://www.jpl.nasa.gov/missions/insight/',
  },
  {
    id: 'kourou',
    name: 'Kourou',
    fullName: 'Centro Espacial de Guayana · Kourou',
    kind: 'launch-site',
    summary:
      'Puerto Espacial Europeo en la Guayana Francesa. El marcador corresponde a ELA-3, origen del vuelo de Ariane 5 que llevó a Webb al espacio.',
    role: 'Lanzamientos espaciales europeos',
    facilityUrl: 'https://www.esa.int/Enabling_Support/Space_Transportation/Europe_s_Spaceport',
    region: 'Kourou, Guayana Francesa · Francia',
    pad: 'Área de lanzamiento Ariane 3 (ELA-3)',
    latitude: 5.239,
    longitude: -52.768,
    coordinateSource: 'https://en.wikipedia.org/wiki/ELA-3',
    mission: 'James Webb',
    launchDate: '2021-12-25',
    description:
      'Un Ariane 5 lanzó el telescopio espacial James Webb desde el Puerto Espacial Europeo.',
    videoId: 'o1fIKK-jNEc',
    videoCredit: 'ESA / CNES / Arianespace',
    sourceUrl: 'https://www.esa.int/ESA_Multimedia/Videos/2021/12/Liftoff_replay_Webb_on_Ariane_5',
    videoLocation: 'Centro Espacial de Guayana · ELA-3, Kourou',
    videoRelation: 'El telescopio James Webb despegó desde ELA-3 a bordo de un Ariane 5.',
    relationSourceUrl:
      'https://www.esa.int/ESA_Multimedia/Videos/2021/12/Liftoff_replay_Webb_on_Ariane_5',
  },
  ...nasaCenters,
];

/** Curated historical catalogue; no live launch feed or mission demo records. */
export class LocalLaunchSitesRepository implements LaunchSitesRepository {
  async load(signal?: AbortSignal): Promise<readonly LaunchSite[]> {
    signal?.throwIfAborted();
    return sites.map((site) => ({ ...site }));
  }
}
