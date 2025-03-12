import axios from 'axios';
import type { ZipCodeResult } from '$lib/types';

const BASEROW_API_URL = import.meta.env.VITE_BASEROW_API_URL;
const BASEROW_API_TOKEN = import.meta.env.VITE_BASEROW_API_TOKEN;
const TABLE_ID = import.meta.env.VITE_BASEROW_TABLE_ID;

export async function lookupZipCode(zipCode: string): Promise<ZipCodeResult> {
  try {
    const response = await axios.get(`${BASEROW_API_URL}/database/rows/table/${TABLE_ID}/`, {
      headers: {
        'Authorization': `Token ${BASEROW_API_TOKEN}`
      },
      params: {
        search: zipCode,
        user_field_names: true
      }
    });

    if (response.data.count > 0) {
      const result = response.data.results[0];
      return {
        zip_code: result.zip_code,
        state: result.state,
        chapter: result.chapter,
        chapter_id: result.chapter_id,
        seller_no: result.seller_no,
        found: true
      };
    }

    return {
      zip_code: zipCode,
      state: '',
      chapter: '',
      chapter_id: '',
      seller_no: 0,
      found: false
    };
  } catch (error) {
    console.error('Error looking up zip code:', error);
    throw new Error('Failed to lookup zip code');
  }
}
