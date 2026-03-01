export interface PhaseTemplate {
  phase_name: string;
  items: string[];
}

export const DEFAULT_PROJECT_TEMPLATE: PhaseTemplate[] = [
  {
    phase_name: 'Land Inspection',
    items: ['Technical Sheet', 'Permits'],
  },
  {
    phase_name: 'Preliminary',
    items: [
      'Arquitectural Design',
      'Engineering Design',
      'Warrant Deed',
      'Commencement Letter',
      'Final Survey',
      'Approval',
    ],
  },
  {
    phase_name: 'Construction',
    items: [
      'Material Sourcing',
      'Excavation',
      'Wiring',
      'Concrete Foundation',
      'Spa',
      'Plumbing',
      'Electric',
      'Accessories (jets, lights, etc)',
      'Equipment Installation',
      'Sand Placement',
      'Pavers',
      'Finishing / Pebbles',
      'Site Cleaning',
      'Badass waterfall feature',
    ],
  },
  {
    phase_name: 'Inspections',
    items: [
      'Concrete Slab',
      'Structure',
      'Foundation',
      'Open Ditch - Underground pipe',
      'Underground Electric',
      'Pool Light bond',
      'Electric Rough',
      'Pipe pressure',
      'Electric Final',
      'Pool Safety',
      'Deck Slab',
      'Final Inspection',
    ],
  },
];
