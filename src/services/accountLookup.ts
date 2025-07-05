
// Simulated account database for US Bank customers
const accountDatabase: Record<string, { name: string; accountType: string }> = {
  '1234567890': { name: 'John Smith', accountType: 'Checking' },
  '2345678901': { name: 'Sarah Johnson', accountType: 'Savings' },
  '3456789012': { name: 'Michael Brown', accountType: 'Checking' },
  '4567890123': { name: 'Emily Davis', accountType: 'Savings' },
  '5678901234': { name: 'David Wilson', accountType: 'Checking' },
  '6789012345': { name: 'Jessica Miller', accountType: 'Savings' },
  '7890123456': { name: 'Robert Taylor', accountType: 'Checking' },
  '8901234567': { name: 'Ashley Anderson', accountType: 'Savings' },
  '9012345678': { name: 'Christopher Thomas', accountType: 'Checking' },
  '0123456789': { name: 'Amanda Jackson', accountType: 'Savings' },
};

export const lookupAccountName = async (accountNumber: string): Promise<{ name: string; accountType: string } | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Remove any spaces or formatting
  const cleanAccountNumber = accountNumber.replace(/\s+/g, '');
  
  return accountDatabase[cleanAccountNumber] || null;
};

export const isValidUSBankAccount = (accountNumber: string): boolean => {
  const cleanAccountNumber = accountNumber.replace(/\s+/g, '');
  return /^\d{10}$/.test(cleanAccountNumber);
};
