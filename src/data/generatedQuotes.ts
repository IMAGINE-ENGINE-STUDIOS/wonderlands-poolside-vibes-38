// Generated Quotes — the quotes produced by the Pool Quotes lane with the
// platform quote tool (wonderlandsworld.com/quote) for homeowner packages.
// Data-file backed: each new generated quote is appended here as it is filed.
// The PDFs live with the lane's records (~/workspace/pool-quotes/).

export interface GeneratedQuoteFeature {
  name: string;
  price: number;
}

export interface GeneratedQuote {
  id: string;
  customer: string;
  location: string;
  model: string;
  construction: string;
  dimensions: string;
  basePrice: number;
  features: GeneratedQuoteFeature[];
  totalInvestment: number;
  quoteDate: string;
  pdfFile: string;
  status: string;
}

const royalLake12: Pick<GeneratedQuote, 'model' | 'construction' | 'dimensions' | 'basePrice' | 'features' | 'totalInvestment'> = {
  model: 'Royal Lake',
  construction: 'Concrete pool',
  dimensions: "12' × 18'",
  basePrice: 43200,
  features: [
    { name: 'Pool Finish: Black Pearl', price: 4200 },
    { name: 'Pool Heater: Pentair MasterTemp 125 (125K BTU)', price: 3450 },
    { name: 'Deck Pavers: Appian Rio, 216 sq ft', price: 3240 },
  ],
  totalInvestment: 54090,
};

const royalLake10: Pick<GeneratedQuote, 'model' | 'construction' | 'dimensions' | 'basePrice' | 'features' | 'totalInvestment'> = {
  model: 'Royal Lake 10.16',
  construction: 'Concrete pool',
  dimensions: "10' × 16'",
  basePrice: 41000,
  features: [
    { name: 'Pool Finish: Black Pearl', price: 4200 },
    { name: 'Pool Heater: Pentair MasterTemp 125 (125K BTU)', price: 3450 },
    { name: 'Deck Pavers: Appian Rio, 192 sq ft', price: 2880 },
  ],
  totalInvestment: 51530,
};

export const generatedQuotes: GeneratedQuote[] = [
  {
    id: 'gq-2026-11-19-buffington',
    customer: 'Joseph Buffington',
    location: 'Gainesville (quote reads FL; homeowner verified Gainesville, GA — flagged)',
    model: 'Royal Lake',
    construction: 'Concrete pool',
    dimensions: "12' × 18'",
    basePrice: 43200,
    features: [
      { name: 'Pool Finish: Black Pearl (standard finish, included)', price: 0 },
      { name: 'Pool Heater: Pentair MasterTemp 125 (125K BTU)', price: 3450 },
    ],
    totalInvestment: 46650,
    quoteDate: '2026-11-19',
    pdfFile: 'joseph-buffington-quote.pdf',
    status: 'Package approved by the founder; sent by email 2026-11-19',
  },
  {
    id: 'gq-2026-11-19-boydston',
    customer: 'James Boydston',
    location: 'Southwest Florida',
    ...royalLake12,
    quoteDate: '2026-11-19',
    pdfFile: 'james-boydston-quote.pdf',
    status: 'Prepared; package message built from the master letter',
  },
  {
    id: 'gq-2026-11-19-klingel',
    customer: 'Eric Klingel',
    location: 'South Florida',
    model: 'Astoria 12',
    construction: 'Fiberglass pool',
    dimensions: "12' × 25'",
    basePrice: 81900,
    features: [
      { name: 'Pool Finish: Sapphire Blue (Crystite Crystal)', price: 3500 },
      { name: 'Pool Heater: Pentair MasterTemp 125 (125K BTU)', price: 3450 },
      { name: 'Deck Pavers: Appian Rio, 258 sq ft', price: 3870 },
    ],
    totalInvestment: 92720,
    quoteDate: '2026-11-19',
    pdfFile: 'eric-klingel-quote.pdf',
    status: 'Prepared; package message built from the master letter',
  },
  {
    id: 'gq-2026-11-19-parsons',
    customer: 'Scott Parsons',
    location: 'The Villages, FL',
    ...royalLake12,
    quoteDate: '2026-11-19',
    pdfFile: 'scott-parsons-quote.pdf',
    status: 'Prepared; package message built from the master letter',
  },
  {
    id: 'gq-2026-11-19-fowler',
    customer: 'Chris Fowler',
    location: 'Estero, FL',
    ...royalLake12,
    quoteDate: '2026-11-19',
    pdfFile: 'chris-fowler-quote.pdf',
    status: 'Prepared; package message built from the master letter',
  },
  {
    id: 'gq-2026-11-19-shelton',
    customer: 'Denny Shelton',
    location: 'Babcock Ranch, FL',
    ...royalLake12,
    quoteDate: '2026-11-19',
    pdfFile: 'denny-shelton-quote.pdf',
    status: 'Prepared; package message built from the master letter',
  },
  {
    id: 'gq-2026-11-19-estes',
    customer: 'Kena Estes',
    location: 'State not verified',
    ...royalLake10,
    quoteDate: '2026-11-19',
    pdfFile: 'kena-estes-quote.pdf',
    status: 'Prepared; state check owed before any send',
  },
  {
    id: 'gq-2026-11-19-gina-marie',
    customer: 'Gina Marie',
    location: 'State not verified',
    ...royalLake10,
    quoteDate: '2026-11-19',
    pdfFile: 'gina-marie-quote.pdf',
    status: 'Prepared; state check owed before any send',
  },
  {
    id: 'gq-2026-11-19-frost',
    customer: 'Kristen Frost',
    location: 'Southwest Florida',
    ...royalLake10,
    quoteDate: '2026-11-19',
    pdfFile: 'kristen-frost-quote.pdf',
    status: 'Prepared; package message built from the master letter',
  },
  {
    id: 'gq-2026-11-19-cline',
    customer: 'Kara Walker Cline',
    location: 'Held — not Florida (Memphis / Southaven signals)',
    ...royalLake12,
    quoteDate: '2026-11-19',
    pdfFile: 'kara-walker-cline-quote.pdf',
    status: 'Prepared; held as a non Florida package',
  },
  {
    id: 'gq-2026-11-19-lopez',
    customer: 'Yaudelkys López Hernández',
    location: 'Held — not Florida (Cuba signals)',
    ...royalLake10,
    quoteDate: '2026-11-19',
    pdfFile: 'yaudelkys-lopez-hernandez-quote.pdf',
    status: 'Prepared; held as a non Florida package',
  },
  {
    id: 'gq-2026-11-19-mascola',
    customer: 'Adam Mascola',
    location: 'Held — not Florida (Dallas, GA signals)',
    ...royalLake12,
    quoteDate: '2026-11-19',
    pdfFile: 'adam-mascola-quote.pdf',
    status: 'Prepared; held as a non Florida package',
  },
];
