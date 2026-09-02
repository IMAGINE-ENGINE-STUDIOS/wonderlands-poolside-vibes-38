/**
 * Residential electricity tariffs by country — the token the yearly simulation
 * multiplies its accumulated kWh by.
 *
 * `rate` is the household price of one kilowatt-hour in the country's own
 * currency, all-in (energy + delivery + tax), and `usdPerKwh` is the same
 * figure in dollars so the model can cross-check against Florida. Figures are
 * 2025/26 residential averages and are the single source for the console.
 */

export interface ElectricityTariff {
  /** ISO 3166-1 alpha-2 */
  code: string;
  country: string;
  /** ISO 4217 currency of `rate` */
  currency: string;
  /** Household price per kWh in `currency` */
  rate: number;
  /** The same price expressed in USD */
  usdPerKwh: number;
  /** Grid label shown beside the token */
  grid: string;
}

export const ELECTRICITY_TARIFFS: ElectricityTariff[] = [
  { code: "US", country: "United States · Florida", currency: "USD", rate: 0.16, usdPerKwh: 0.16, grid: "FPL / Duke · net metering 1:1" },
  { code: "US-CA", country: "United States · California", currency: "USD", rate: 0.33, usdPerKwh: 0.33, grid: "PG&E · NEM 3.0" },
  { code: "US-TX", country: "United States · Texas", currency: "USD", rate: 0.15, usdPerKwh: 0.15, grid: "ERCOT retail" },
  { code: "CA", country: "Canada", currency: "CAD", rate: 0.19, usdPerKwh: 0.14, grid: "Provincial utilities" },
  { code: "MX", country: "Mexico", currency: "MXN", rate: 3.2, usdPerKwh: 0.17, grid: "CFE · DAC tariff" },
  { code: "BR", country: "Brazil", currency: "BRL", rate: 0.86, usdPerKwh: 0.16, grid: "ANEEL · compensação" },
  { code: "AR", country: "Argentina", currency: "ARS", rate: 95, usdPerKwh: 0.09, grid: "EDENOR / EDESUR" },
  { code: "CL", country: "Chile", currency: "CLP", rate: 175, usdPerKwh: 0.19, grid: "Enel · netbilling" },
  { code: "CO", country: "Colombia", currency: "COP", rate: 850, usdPerKwh: 0.21, grid: "Air-e / EPM" },
  { code: "GB", country: "United Kingdom", currency: "GBP", rate: 0.26, usdPerKwh: 0.33, grid: "Ofgem cap · SEG export" },
  { code: "IE", country: "Ireland", currency: "EUR", rate: 0.33, usdPerKwh: 0.36, grid: "ESB · microgen" },
  { code: "DE", country: "Germany", currency: "EUR", rate: 0.36, usdPerKwh: 0.39, grid: "EEG · Einspeisevergütung" },
  { code: "FR", country: "France", currency: "EUR", rate: 0.25, usdPerKwh: 0.27, grid: "EDF · tarif bleu" },
  { code: "ES", country: "Spain", currency: "EUR", rate: 0.22, usdPerKwh: 0.24, grid: "PVPC · autoconsumo" },
  { code: "IT", country: "Italy", currency: "EUR", rate: 0.31, usdPerKwh: 0.34, grid: "ARERA · scambio sul posto" },
  { code: "PT", country: "Portugal", currency: "EUR", rate: 0.24, usdPerKwh: 0.26, grid: "ERSE · UPAC" },
  { code: "NL", country: "Netherlands", currency: "EUR", rate: 0.31, usdPerKwh: 0.34, grid: "Salderingsregeling" },
  { code: "BE", country: "Belgium", currency: "EUR", rate: 0.35, usdPerKwh: 0.38, grid: "Fluvius · prosumer" },
  { code: "CH", country: "Switzerland", currency: "CHF", rate: 0.32, usdPerKwh: 0.36, grid: "ElCom" },
  { code: "SE", country: "Sweden", currency: "SEK", rate: 1.9, usdPerKwh: 0.18, grid: "Nord Pool" },
  { code: "NO", country: "Norway", currency: "NOK", rate: 1.3, usdPerKwh: 0.12, grid: "Nord Pool · plusskunde" },
  { code: "DK", country: "Denmark", currency: "DKK", rate: 2.6, usdPerKwh: 0.38, grid: "Energinet" },
  { code: "PL", country: "Poland", currency: "PLN", rate: 0.95, usdPerKwh: 0.24, grid: "Net-billing RCEm" },
  { code: "AE", country: "United Arab Emirates", currency: "AED", rate: 0.33, usdPerKwh: 0.09, grid: "DEWA Shams" },
  { code: "SA", country: "Saudi Arabia", currency: "SAR", rate: 0.18, usdPerKwh: 0.05, grid: "SEC residential" },
  { code: "ZA", country: "South Africa", currency: "ZAR", rate: 3.1, usdPerKwh: 0.17, grid: "Eskom Homeflex" },
  { code: "IN", country: "India", currency: "INR", rate: 8.5, usdPerKwh: 0.1, grid: "DISCOM · net metering" },
  { code: "AU", country: "Australia", currency: "AUD", rate: 0.36, usdPerKwh: 0.24, grid: "AEMO · feed-in tariff" },
  { code: "NZ", country: "New Zealand", currency: "NZD", rate: 0.34, usdPerKwh: 0.21, grid: "Electricity Authority" },
  { code: "JP", country: "Japan", currency: "JPY", rate: 31, usdPerKwh: 0.21, grid: "FIT / FIP" },
  { code: "KR", country: "South Korea", currency: "KRW", rate: 165, usdPerKwh: 0.12, grid: "KEPCO" },
  { code: "SG", country: "Singapore", currency: "SGD", rate: 0.32, usdPerKwh: 0.24, grid: "SP Group" },
];

export const DEFAULT_TARIFF_CODE = "US";

export const tariffByCode = (code: string): ElectricityTariff =>
  ELECTRICITY_TARIFFS.find((t) => t.code === code) ?? ELECTRICITY_TARIFFS[0];

/** Format an amount in the tariff's own currency. */
export const formatTariffMoney = (amount: number, tariff: ElectricityTariff): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: tariff.currency.split("-")[0].length === 3 ? tariff.currency : "USD",
    maximumFractionDigits: amount >= 100 ? 0 : 2,
  }).format(amount);
