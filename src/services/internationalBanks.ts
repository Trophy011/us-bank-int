// International Banks Database for External Transfers

export interface InternationalBank {
  name: string;
  country: string;
  swiftCode: string;
  type: 'major' | 'regional' | 'online';
}

export const internationalBanks: InternationalBank[] = [
  // United States
  { name: 'JPMorgan Chase Bank', country: 'United States', swiftCode: 'CHASUS33', type: 'major' },
  { name: 'Bank of America', country: 'United States', swiftCode: 'BOFAUS3N', type: 'major' },
  { name: 'Wells Fargo Bank', country: 'United States', swiftCode: 'WFBIUS6S', type: 'major' },
  { name: 'Citibank', country: 'United States', swiftCode: 'CITIUS33', type: 'major' },
  { name: 'US Bank', country: 'United States', swiftCode: 'USBKUS44', type: 'major' },
  { name: 'PNC Bank', country: 'United States', swiftCode: 'PNCCUS33', type: 'major' },
  { name: 'Capital One Bank', country: 'United States', swiftCode: 'HIBKUS44', type: 'online' },
  
  // United Kingdom
  { name: 'Barclays Bank', country: 'United Kingdom', swiftCode: 'BARCGB22', type: 'major' },
  { name: 'HSBC Bank', country: 'United Kingdom', swiftCode: 'HBUKGB4B', type: 'major' },
  { name: 'Lloyds Bank', country: 'United Kingdom', swiftCode: 'LOYDGB2L', type: 'major' },
  { name: 'Royal Bank of Scotland', country: 'United Kingdom', swiftCode: 'RBOSGB2L', type: 'major' },
  { name: 'NatWest', country: 'United Kingdom', swiftCode: 'NWBKGB2L', type: 'major' },
  { name: 'Santander UK', country: 'United Kingdom', swiftCode: 'ABBYGB2L', type: 'major' },
  
  // Germany
  { name: 'Deutsche Bank', country: 'Germany', swiftCode: 'DEUTDEFF', type: 'major' },
  { name: 'Commerzbank', country: 'Germany', swiftCode: 'COBADEFF', type: 'major' },
  { name: 'DZ Bank', country: 'Germany', swiftCode: 'GENODEFF', type: 'major' },
  { name: 'Landesbank Baden-Württemberg', country: 'Germany', swiftCode: 'SOLADEST', type: 'regional' },
  
  // France
  { name: 'BNP Paribas', country: 'France', swiftCode: 'BNPAFRPP', type: 'major' },
  { name: 'Crédit Agricole', country: 'France', swiftCode: 'AGRIFRPP', type: 'major' },
  { name: 'Société Générale', country: 'France', swiftCode: 'SOGEFRPP', type: 'major' },
  { name: 'Crédit Lyonnais', country: 'France', swiftCode: 'LYONFRPP', type: 'major' },
  
  // Switzerland
  { name: 'UBS', country: 'Switzerland', swiftCode: 'UBSWCHZH', type: 'major' },
  { name: 'Credit Suisse', country: 'Switzerland', swiftCode: 'CRESCHZZ', type: 'major' },
  { name: 'Julius Baer', country: 'Switzerland', swiftCode: 'BAERCHZZ', type: 'major' },
  
  // Netherlands
  { name: 'ING Bank', country: 'Netherlands', swiftCode: 'INGBNL2A', type: 'major' },
  { name: 'ABN AMRO Bank', country: 'Netherlands', swiftCode: 'ABNANL2A', type: 'major' },
  { name: 'Rabobank', country: 'Netherlands', swiftCode: 'RABONL2U', type: 'major' },
  
  // Japan
  { name: 'Mitsubishi UFJ Financial Group', country: 'Japan', swiftCode: 'BOTKJPJT', type: 'major' },
  { name: 'Sumitomo Mitsui Banking Corporation', country: 'Japan', swiftCode: 'SMBCJPJT', type: 'major' },
  { name: 'Mizuho Bank', country: 'Japan', swiftCode: 'MHCBJPJT', type: 'major' },
  
  // China
  { name: 'Industrial and Commercial Bank of China', country: 'China', swiftCode: 'ICBKCNBJ', type: 'major' },
  { name: 'China Construction Bank', country: 'China', swiftCode: 'PCBCCNBJ', type: 'major' },
  { name: 'Agricultural Bank of China', country: 'China', swiftCode: 'ABOCCNBJ', type: 'major' },
  { name: 'Bank of China', country: 'China', swiftCode: 'BKCHCNBJ', type: 'major' },
  
// Colombia
{ name: 'Bancolombia', country: 'Colombia', swiftCode: 'COLOCOBM', type: 'major' },
{ name: 'Banco de Bogotá', country: 'Colombia', swiftCode: 'BBOGCOBB', type: 'major' },
{ name: 'Banco Davivienda', country: 'Colombia', swiftCode: 'CFFICOBC', type: 'major' },
{ name: 'Banco de Occidente', country: 'Colombia', swiftCode: 'OCCICOBC', type: 'major' },

// Ecuador
{ name: 'Banco Pichincha', country: 'Ecuador', swiftCode: 'PICHECEQ', type: 'major' },
{ name: 'Banco de Guayaquil', country: 'Ecuador', swiftCode: 'GUAYECEG', type: 'major' },
{ name: 'Produbanco', country: 'Ecuador', swiftCode: 'PRODECEQ', type: 'major' },
{ name: 'Banco Bolivariano', country: 'Ecuador', swiftCode: 'BBOLECEQ', type: 'major' },

// Peru
{ name: 'Banco de Crédito del Perú (BCP)', country: 'Peru', swiftCode: 'BCPLPEPL', type: 'major' },
{ name: 'BBVA Perú', country: 'Peru', swiftCode: 'BCONPEPL', type: 'major' },
{ name: 'Scotiabank Perú', country: 'Peru', swiftCode: 'NSBCPEPL', type: 'major' },
{ name: 'Interbank', country: 'Peru', swiftCode: 'IBKLPEPL', type: 'major' },
 
 // Canada
  { name: 'Royal Bank of Canada', country: 'Canada', swiftCode: 'ROYCCAT2', type: 'major' },
  { name: 'Toronto-Dominion Bank', country: 'Canada', swiftCode: 'TDOMCATTTOR', type: 'major' },
  { name: 'Bank of Nova Scotia', country: 'Canada', swiftCode: 'NOSCCATT', type: 'major' },
  { name: 'Bank of Montreal', country: 'Canada', swiftCode: 'BOFMCAM2', type: 'major' },
  
  // Australia
  { name: 'Commonwealth Bank of Australia', country: 'Australia', swiftCode: 'CTBAAU2S', type: 'major' },
  { name: 'ANZ Bank', country: 'Australia', swiftCode: 'ANZBAU3M', type: 'major' },
  { name: 'Westpac Banking Corporation', country: 'Australia', swiftCode: 'WPACAU2S', type: 'major' },
  { name: 'National Australia Bank', country: 'Australia', swiftCode: 'NATAAU3303M', type: 'major' },
  
  // Singapore
  { name: 'DBS Bank', country: 'Singapore', swiftCode: 'DBSSSGSG', type: 'major' },
  { name: 'Oversea-Chinese Banking Corporation', country: 'Singapore', swiftCode: 'OCBCSGSG', type: 'major' },
  { name: 'United Overseas Bank', country: 'Singapore', swiftCode: 'UOVBSGSG', type: 'major' },
  
  // Hong Kong
  { name: 'Hongkong and Shanghai Banking Corporation', country: 'Hong Kong', swiftCode: 'HSBCHKHH', type: 'major' },
  { name: 'Bank of East Asia', country: 'Hong Kong', swiftCode: 'BEASHKHH', type: 'major' },
  { name: 'Hang Seng Bank', country: 'Hong Kong', swiftCode: 'HASEHKHH', type: 'major' },
  
  // South Korea
  { name: 'KB Kookmin Bank', country: 'South Korea', swiftCode: 'CZNBKRSE', type: 'major' },
  { name: 'Shinhan Bank', country: 'South Korea', swiftCode: 'SHBKKRSE', type: 'major' },
  { name: 'Hana Bank', country: 'South Korea', swiftCode: 'HNBNKRSE', type: 'major' },
  
  // India
  { name: 'State Bank of India', country: 'India', swiftCode: 'SBININBB', type: 'major' },
  { name: 'HDFC Bank', country: 'India', swiftCode: 'HDFCINBB', type: 'major' },
  { name: 'ICICI Bank', country: 'India', swiftCode: 'ICICINBB', type: 'major' },
  { name: 'Axis Bank', country: 'India', swiftCode: 'AXISINBB', type: 'major' },
  
  // Brazil
  { name: 'Banco do Brasil', country: 'Brazil', swiftCode: 'BRASBRRJ', type: 'major' },
  { name: 'Itaú Unibanco', country: 'Brazil', swiftCode: 'ITAUBRSP', type: 'major' },
  { name: 'Bradesco', country: 'Brazil', swiftCode: 'BBDEBRSP', type: 'major' },
  
  // Russia
  { name: 'Sberbank', country: 'Russia', swiftCode: 'SABRRUMM', type: 'major' },
  { name: 'VTB Bank', country: 'Russia', swiftCode: 'VTBRRUMM', type: 'major' },
  
  // Spain
  { name: 'Banco Santander', country: 'Spain', swiftCode: 'BSCHESMM', type: 'major' },
  { name: 'Banco Bilbao Vizcaya Argentaria', country: 'Spain', swiftCode: 'BBVAESMM', type: 'major' },
  { name: 'CaixaBank', country: 'Spain', swiftCode: 'CAIXESBB', type: 'major' },
  
  // Italy
  { name: 'UniCredit', country: 'Italy', swiftCode: 'UNCRITMM', type: 'major' },
  { name: 'Intesa Sanpaolo', country: 'Italy', swiftCode: 'BCITITMM', type: 'major' },
  
  // Philippines
  { name: 'BDO Unibank', country: 'Philippines', swiftCode: 'BNORPHMM', type: 'major' },
  { name: 'Metropolitan Bank & Trust Company', country: 'Philippines', swiftCode: 'MBTCPHMM', type: 'major' },
  { name: 'Bank of the Philippine Islands', country: 'Philippines', swiftCode: 'BOPIPHMM', type: 'major' },
  { name: 'Land Bank of the Philippines', country: 'Philippines', swiftCode: 'TLBPPHMM', type: 'major' },
  { name: 'Philippine National Bank', country: 'Philippines', swiftCode: 'PNBMPHMM', type: 'major' },
  { name: 'Security Bank Corporation', country: 'Philippines', swiftCode: 'SETCPHMM', type: 'major' },
  { name: 'UnionBank of the Philippines', country: 'Philippines', swiftCode: 'UBPHPHMM', type: 'major' },
  { name: 'China Banking Corporation', country: 'Philippines', swiftCode: 'CHBKPHMM', type: 'major' },
  { name: 'Rizal Commercial Banking Corporation', country: 'Philippines', swiftCode: 'RCBCPHMM', type: 'major' },
  { name: 'Philippine Savings Bank', country: 'Philippines', swiftCode: 'PSBKPHMM', type: 'regional' },
  
  // Poland
  { name: 'PKO Bank Polski', country: 'Poland', swiftCode: 'BPKOPLPW', type: 'major' },
  { name: 'Bank Pekao', country: 'Poland', swiftCode: 'PKOPPLPW', type: 'major' },
  { name: 'mBank', country: 'Poland', swiftCode: 'BREXPLPW', type: 'major' },
  { name: 'ING Bank Śląski', country: 'Poland', swiftCode: 'INGBPLPW', type: 'major' },
  { name: 'Santander Bank Polska', country: 'Poland', swiftCode: 'WBKPPLPP', type: 'major' },
  
  // Mexico
  { name: 'BBVA México', country: 'Mexico', swiftCode: 'BCMRMXMM', type: 'major' },
  { name: 'Banamex', country: 'Mexico', swiftCode: 'BNMXMXMM', type: 'major' },
  { name: 'Banco Santander México', country: 'Mexico', swiftCode: 'BMSXMXMM', type: 'major' },
  
  // Nordic Countries
  { name: 'Nordea Bank', country: 'Sweden', swiftCode: 'NDEASESS', type: 'major' },
  { name: 'Svenska Handelsbanken', country: 'Sweden', swiftCode: 'HANDSESS', type: 'major' },
  { name: 'Swedbank', country: 'Sweden', swiftCode: 'SWEDSESS', type: 'major' },
  { name: 'DNB Bank', country: 'Norway', swiftCode: 'DNBANOKKXXX', type: 'major' },
  { name: 'Danske Bank', country: 'Denmark', swiftCode: 'DABADKKK', type: 'major' },
];

export const getBanksByCountry = (country: string): InternationalBank[] => {
  return internationalBanks.filter(bank => bank.country === country);
};

export const getAllCountries = (): string[] => {
  const countries = new Set(internationalBanks.map(bank => bank.country));
  return Array.from(countries).sort();
};

export const searchBanks = (query: string): InternationalBank[] => {
  const lowerQuery = query.toLowerCase();
  return internationalBanks.filter(bank => 
    bank.name.toLowerCase().includes(lowerQuery) ||
    bank.country.toLowerCase().includes(lowerQuery) ||
    bank.swiftCode.toLowerCase().includes(lowerQuery)
  );
};
