export const referencePlanets = [
  {
    id: 'mercury',
    name: 'Mercurio',
    radius: 0.27,
    color: '#96938e',
    period: 180,
  },
  {
    id: 'venus',
    name: 'Venus',
    radius: 0.43,
    color: '#ceb079',
    period: 200,
  },
  {
    id: 'jupiter',
    name: 'Júpiter',
    radius: 1.05,
    color: '#c9a488',
    period: 100,
  },
  {
    id: 'saturn',
    name: 'Saturno',
    radius: 0.65,
    color: '#c7b48c',
    period: 120,
  },
  {
    id: 'uranus',
    name: 'Urano',
    radius: 0.5,
    color: '#7cc7d0',
    period: 160,
  },
  {
    id: 'neptune',
    name: 'Neptuno',
    radius: 0.46,
    color: '#477ad2',
    period: 150,
  },
] as const;
export type ReferencePlanet = (typeof referencePlanets)[number];
