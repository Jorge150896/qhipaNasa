// OSD-575, panel metabólico transformado. Medianas por fase de las cuatro muestras.
// CSV original y método documentados en docs/product/hhc-health-workspace.md.
export const inspiration4MetabolicHistory = {
  mission: 'Inspiration4',
  study: 'NASA OSDR · OSD-575',
  source: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-575',
  download:
    'https://osdr.nasa.gov/geode-py/ws/studies/OSD-575/download?source=datamanager&file=LSDS-8_Comprehensive_Metabolic_Panel_CMP_TRANSFORMED.csv',
  sampleCount: 4,
  points: [
    { phase: 'L-92', glucose: 80, sodium: 140, potassium: 4.05 },
    { phase: 'L-44', glucose: 76, sodium: 139.5, potassium: 4.1 },
    { phase: 'L-3', glucose: 72, sodium: 141.5, potassium: 3.75 },
    { phase: 'R+1', glucose: 93.5, sodium: 137.5, potassium: 3.75 },
    { phase: 'R+45', glucose: 43.5, sodium: 138.5, potassium: 4.25 },
    { phase: 'R+82', glucose: 80, sodium: 140, potassium: 3.95 },
    { phase: 'R+194', glucose: 84, sodium: 137.5, potassium: 4.05 },
  ],
} as const;
