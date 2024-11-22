export function generateCustomerCode(companyName: string): string {
  // Remove special characters and spaces, convert to uppercase
  const cleanName = companyName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

  // Split into words
  const words = cleanName.split(' ');

  if (words.length === 1) {
    // Single word - take first 4 characters
    return words[0].slice(0, 4);
  } else {
    // Multiple words - take first letter of each word up to 4 characters
    return words
      .map(word => word[0])
      .join('')
      .slice(0, 4);
  }
}