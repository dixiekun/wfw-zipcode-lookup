import { json } from '@sveltejs/kit';
import { lookupZipCode } from '$lib/services/baserow';
import { isValidZipCode } from '$lib/utils/validation';

export async function GET({ url }) {
  const zipCode = url.searchParams.get('zip');
  
  if (!zipCode || !isValidZipCode(zipCode)) {
    return json({ error: 'Invalid zip code format' }, { status: 400 });
  }
  
  try {
    const result = await lookupZipCode(zipCode);
    return json(result);
  } catch (error) {
    console.error('Error in zip code lookup:', error);
    return json({ error: 'Failed to lookup zip code' }, { status: 500 });
  }
}
