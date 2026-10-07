/** Investor spreadsheets (values only), rendered natively in the data room. Regenerate from the partner .xlsx files when they change. */
export type Sheet = { title: string; rows: string[][] };
export const INVESTOR_SHEETS: Record<"pools" | "software" | "captable", Sheet[]> = {
 "pools": [
  {
   "title": "100 Pools $5M - Charts",
   "rows": [
    [
     "WONDERLANDS WORLD EXPERIENCE - 100 POOLS FINANCIAL - GRAPHIC CHARTS COMPATIBLE WITH EXCEL"
    ],
    [
     "TABLE 1: 100 PROJECTS = $5,000,000 • GROSS $1,732,500 • 34.65% • WITH EXCEL CHARTS"
    ],
    [
     "Revenue Category",
     "Projects",
     "Avg Ticket",
     "Total Revenue",
     "Margin",
     "Gross Profit",
     "% of Total"
    ],
    [
     "Pool Construction",
     "30",
     "90,000",
     "2,700,000",
     "35%",
     "945,000",
     "54"
    ],
    [
     "Pool Renovation",
     "20",
     "40,000",
     "800,000",
     "35%",
     "280,000",
     "16"
    ],
    [
     "Outdoor Living",
     "10",
     "60,000",
     "600,000",
     "35%",
     "210,000",
     "12"
    ],
    [
     "Outdoor Kitchens",
     "10",
     "40,000",
     "400,000",
     "35%",
     "140,000",
     "8"
    ],
    [
     "Landscaping",
     "5",
     "25,000",
     "125,000",
     "30%",
     "37,500",
     "2.5"
    ],
    [
     "Pavers",
     "10",
     "20,000",
     "200,000",
     "30%",
     "60,000",
     "4"
    ],
    [
     "Saunas / Spas",
     "10",
     "15,000",
     "150,000",
     "30%",
     "45,000",
     "3"
    ],
    [
     "Design Services",
     "5",
     "5,000",
     "25,000",
     "60%",
     "15,000",
     "0.5"
    ],
    [
     "TOTAL 100 PROJECTS",
     "100",
     "50,000",
     "5,000,000",
     "34.65%",
     "1,732,500",
     "100"
    ]
   ]
  },
  {
   "title": "5M vs 10M Comparison - Chart",
   "rows": [
    [
     "100 POOLS COMPARISON: $5M MIXED vs $10M PURE POOLS - EXCEL CHARTS"
    ],
    [
     "Scenario",
     "Projects",
     "Avg Ticket",
     "Total Revenue",
     "Gross Profit (35%)"
    ],
    [
     "100 Mixed Projects (Current)",
     "100",
     "50,000",
     "5,000,000",
     "1,750,000"
    ],
    [
     "100 Pure Pools @ $90K",
     "100",
     "90,000",
     "9,000,000",
     "3,150,000"
    ],
    [
     "100 Pure Pools @ $100K (Your $10M)",
     "100",
     "100,000",
     "10,000,000",
     "3,500,000"
    ],
    [
     "100 Pure Pools @ $120K Premium",
     "100",
     "120,000",
     "12,000,000",
     "4,200,000"
    ]
   ]
  },
  {
   "title": "5-Year Projection - Chart",
   "rows": [
    [
     "UNIFIED 5-YEAR PROJECTION - WITH LINE CHART - EXCEL COMPATIBLE"
    ],
    [
     "Year",
     "Direct Projects",
     "Consumer Revenue",
     "Total Revenue",
     "Growth %"
    ],
    [
     "Actual 2025-26",
     "4",
     "178,675",
     "178,675",
     "0"
    ],
    [
     "Year1 100 proj Mixed $5M",
     "100",
     "5,000,000",
     "5,977,500",
     "3,245"
    ],
    [
     "Year1 100 pure $10M",
     "100",
     "10,000,000",
     "10,977,500",
     "6,044"
    ],
    [
     "Year2 175 proj",
     "175",
     "8,750,000",
     "11,412,500",
     "91"
    ],
    [
     "Year3 275 proj",
     "275",
     "13,750,000",
     "19,850,000",
     "74"
    ],
    [
     "Year4 425 proj",
     "425",
     "21,250,000",
     "33,450,000",
     "69"
    ],
    [
     "Year5 650 proj Mixed",
     "650",
     "32,500,000",
     "54,675,000",
     "63"
    ],
    [
     "Year5 650 pure",
     "650",
     "65,000,000",
     "87,175,000",
     "59"
    ]
   ]
  },
  {
   "title": "Dashboard - Graphic Summary",
   "rows": [
    [
     "WONDERLANDS DASHBOARD - GRAPHIC SUMMARY - ALL CHARTS EXCEL NATIVE"
    ],
    [
     "KEY METRICS - 100 POOLS"
    ],
    [
     "100 Mixed Projects = $5M avg $50K - Gross $1.73M (34.65%)"
    ],
    [
     "100 Pure Pools @ $100K = $10M - Gross $3.5M (35%) - YES your $10M correct for pure pools"
    ],
    [
     "Year1 Total $5.97M Mixed / $10.97M Pure → Year5 $54.67M / $87.17M"
    ]
   ]
  }
 ],
 "software": [
  {
   "title": "SaaS Packages - Charts",
   "rows": [
    [
     "WONDERLANDS SOFTWARE SALES - SAAS PACKAGES - 80% MARGIN - EXCEL CHARTS COMPATIBLE"
    ],
    [
     "TABLE 2A: CORE PACKAGES • TABLE 2B: ADD-ONS • TABLE 2C: SCALE - BRANDED GRAPHIC CHARTS"
    ],
    [
     "2A: SaaS Packages - Core Engine"
    ],
    [
     "Package",
     "Annual Price",
     "Seats",
     "Margin",
     "Gross / Customer",
     "Setup Fee",
     "Total Year1 Value"
    ],
    [
     "Starter Studio",
     "5,000",
     "2",
     "80%",
     "4,000",
     "5,000",
     "10,000"
    ],
    [
     "Pro Business - HERO",
     "15,000",
     "5",
     "80%",
     "12,000",
     "5,000",
     "20,000"
    ],
    [
     "Enterprise GC",
     "50,000",
     "15",
     "80%",
     "40,000",
     "5,000",
     "55,000"
    ],
    [
     "2B: Add-On Revenue Streams"
    ],
    [
     "Revenue Stream",
     "Model",
     "Margin",
     "Typical Annual",
     "Example",
     "",
     "Margin Num"
    ],
    [
     "Additional Seats",
     "Annual licenses",
     "80%",
     "1,200",
     "$100/mo per seat",
     "",
     "80"
    ],
    [
     "Premium Design Tools",
     "Subscription add-on",
     "80%",
     "2,400",
     "$200/mo",
     "",
     "80"
    ],
    [
     "AI Features",
     "Premium subscription",
     "80%",
     "3,600",
     "$300/mo",
     "",
     "80"
    ],
    [
     "Marketing Automation",
     "Premium module",
     "80%",
     "3,000",
     "$250/mo",
     "",
     "80"
    ],
    [
     "Advanced Analytics",
     "Premium module",
     "85%",
     "1,800",
     "$150/mo",
     "",
     "85"
    ],
    [
     "Implementation / Onboarding",
     "One-time fee",
     "50%",
     "2,500",
     "One-time",
     "",
     "50"
    ],
    [
     "Integrations",
     "Setup + recurring",
     "60%",
     "1,500",
     "$500 setup + $83/mo",
     "",
     "60"
    ],
    [
     "White-Label Platform",
     "Enterprise licensing",
     "75%",
     "15,000",
     "$1250/mo",
     "",
     "75"
    ]
   ]
  },
  {
   "title": "SaaS Scale & 5-Year - Charts",
   "rows": [
    [
     "SAAS SCALE - MIX 40% STARTER / 50% PRO / 10% ENTERPRISE - WITH CHARTS"
    ],
    [
     "Customers",
     "Annual Revenue",
     "Gross 80%",
     "MRR",
     "ARR",
     "Mix Details"
    ],
    [
     "100",
     "1,350,000",
     "1,080,000",
     "112,500",
     "1,350,000",
     "40 Starter / 50 Pro / 10 Ent"
    ],
    [
     "250",
     "3,375,000",
     "2,700,000",
     "281,250",
     "3,375,000",
     "100 / 125 / 25"
    ],
    [
     "500",
     "6,750,000",
     "5,400,000",
     "562,500",
     "6,750,000",
     "200 / 250 / 50"
    ],
    [
     "1,000",
     "13,500,000",
     "10,800,000",
     "1,125,000",
     "13,500,000",
     "400 / 500 / 100"
    ],
    [
     "2,500",
     "33,750,000",
     "27,000,000",
     "2,812,500",
     "33,750,000",
     "1000 / 1250 / 250"
    ],
    [
     "2D: 5-Year SaaS Projection - 100 Pools Base vs Pure Pools Base"
    ],
    [
     "Year - 100 Pools Base",
     "Customers",
     "Base Revenue",
     "With Add-Ons (20%)",
     "Gross Profit",
     "MRR"
    ],
    [
     "Y1 100 proj Mixed $5M",
     "40",
     "540,000",
     "648,000",
     "432,000",
     "45,000"
    ],
    [
     "Y1 100 pure $10M",
     "80",
     "1,080,000",
     "1,296,000",
     "864,000",
     "90,000"
    ],
    [
     "Y2 175 proj",
     "100",
     "1,350,000",
     "1,620,000",
     "1,080,000",
     "112,500"
    ],
    [
     "Y3 275 proj",
     "225",
     "3,037,500",
     "3,645,000",
     "2,430,000",
     "253,125"
    ],
    [
     "Y4 425 proj",
     "450",
     "6,075,000",
     "7,290,000",
     "4,860,000",
     "506,250"
    ],
    [
     "Y5 650 proj Mixed",
     "800",
     "10,800,000",
     "12,960,000",
     "8,640,000",
     "900,000"
    ],
    [
     "Y5 650 pure",
     "1,500",
     "20,250,000",
     "24,300,000",
     "16,200,000",
     "1,687,500"
    ]
   ]
  },
  {
   "title": "Software Dashboard - Charts",
   "rows": [
    [
     "SOFTWARE SALES DASHBOARD - GRAPHIC CHARTS - EXCEL COMPATIBLE"
    ],
    [
     "SOFTWARE SALES SUMMARY - 80% MARGIN RECURRING"
    ],
    [
     "Core Packages: Starter $5K (2 seats) $4K gross, Pro HERO $15K (5 seats) $12K gross, Enterprise $50K (15 seats) $40K gross"
    ],
    [
     "Setup Fee: $5K mandatory ASC 606 / ASC 340-40"
    ],
    [
     "Add-Ons: Seats 80%, Design 80%, AI 80%, Marketing 80%, Analytics 85%, Implementation 50%, Integrations 60%, White-Label 75%"
    ],
    [
     "Scale: 100 cust $1.35M $1.08M gross MRR $112.5K → 1000 cust $13.5M $10.8M gross MRR $1.125M"
    ],
    [
     "Mix: 40% Starter / 50% Pro / 10% Enterprise"
    ],
    [
     "5-Year Y1 40 cust $540K $648K w/ add-ons $432K gross → Y5 800 cust $10.8M $12.96M $8.64M gross"
    ],
    [
     "With 100 Pure Pools $10M base: Y1 80 cust $1.08M / $1.29M $864K gross → Y5 1500 cust $20.25M / $24.3M $16.2M gross"
    ],
    [
     "All charts Excel-native - editable, compatible with Excel, Google Sheets"
    ]
   ]
  }
 ],
 "captable": [
  {
   "title": "Cap Table - 25% Each",
   "rows": [
    [
     "WONDERLANDS WORLD EXPERIENCE - CAP TABLE - 25% EACH - 4 PARTNERS"
    ],
    [
     "Partner",
     "Ownership %",
     "Units",
     "Voting %",
     "Profit Distribution",
     "Value on $5M Mixed",
     "Value on $10M Pure"
    ],
    [
     "Ricardo",
     "0.25",
     "25",
     "25",
     "25%",
     "1,250,000",
     "2,500,000"
    ],
    [
     "Khalia",
     "0.25",
     "25",
     "25",
     "25%",
     "1,250,000",
     "2,500,000"
    ],
    [
     "Roberto",
     "0.25",
     "25",
     "25",
     "25%",
     "1,250,000",
     "2,500,000"
    ],
    [
     "Jose",
     "0.25",
     "25",
     "25",
     "25%",
     "1,250,000",
     "2,500,000"
    ],
    [
     "TOTAL",
     "1",
     "100",
     "100",
     "100%",
     "5,000,000",
     "10,000,000"
    ],
    [
     "Summary - Consistent with Previous Numbers"
    ],
    [
     "Each Partner 25% = $1.25M revenue share on $5M mixed (30×$90K etc) or $2.5M on $10M pure pools"
    ],
    [
     "Gross share per partner: $433,125 on $5M (34.65%) or $875,000 on $10M (35%)"
    ],
    [
     "Voting: Equal 25% each - No majority - 51% = 3 partners for decisions"
    ],
    [
     "Total Units: 100 units - 25 units each - Ricardo, Khalia, Roberto, Jose"
    ]
   ]
  }
 ]
};
