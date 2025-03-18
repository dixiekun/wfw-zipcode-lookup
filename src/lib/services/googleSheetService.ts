import axios from 'axios';
import type { ZipCodeData } from '$lib/types/zipCodeData';

const SHEET_ID = '12-4CpBOktv2rWTGBuFJ9yudsAJnB-7i2od-Ws5eqtBM';
const SHEET_NAME = 'Sheet1'; // Adjust if your sheet has a different name

/**
 * Fetches zipcode data from a public Google Sheet
 * Uses the Google Sheets API v4 with the sheets.spreadsheets.values.get method
 */
export async function fetchZipCodeData(): Promise<ZipCodeData[]> {
  try {
    // Convert Google Sheet to CSV format using the export URL
    const response = await axios.get(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`
    );

    // Parse CSV data
    const rows = parseCSV(response.data);
    
    // Skip header row and map to ZipCodeData objects
    return rows.slice(1).map((row) => {
      return {
        zipCode: row[0]?.trim() || '',
        state: row[1]?.trim() || '',
        chapter: row[2]?.trim() || '',
        sellerNo: row[4]?.trim() || ''
      };
    });
  } catch (error) {
    console.error('Error fetching data from Google Sheet:', error);
    throw new Error('Failed to fetch zipcode data');
  }
}

/**
 * Simple CSV parser
 */
function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n');
  return lines.map(line => {
    // Handle quoted values with commas inside them
    const result = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    result.push(currentValue);
    
    // Clean up quotes from values
    return result.map(value => value.replace(/^"|"$/g, ''));
  }).filter(row => row.length > 0 && row.some(cell => cell.trim() !== ''));
}

/**
 * Searches for zipcode data by zipcode
 */
export function searchByZipCode(data: ZipCodeData[], zipCode: string): ZipCodeData | undefined {
  return data.find(item => item.zipCode === zipCode);
}
