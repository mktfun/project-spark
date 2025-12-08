import axios from 'axios';

const CHATWOOT_API_URL = process.env.CHATWOOT_API_URL || 'http://bot-chatwoot-rails-1:3000';
const CHATWOOT_ACCESS_TOKEN = process.env.CHATWOOT_ACCESS_TOKEN;
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID || '1';

const api = axios.create({
    baseURL: `${CHATWOOT_API_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}`,
    headers: {
        'api_access_token': CHATWOOT_ACCESS_TOKEN,
        'Content-Type': 'application/json'
    }
});

export const createChatwootContact = async (name: string, email?: string, phone?: string) => {
    console.log(`[CHATWOOT SYNC] Starting sync for: ${name}, ${phone}, ${email}`);
    console.log(`[CHATWOOT CONFIG] URL: ${CHATWOOT_API_URL}, Account: ${CHATWOOT_ACCOUNT_ID}, Token Present: ${!!CHATWOOT_ACCESS_TOKEN}`);

    try {
        if (!CHATWOOT_ACCESS_TOKEN) {
            console.error('[CHATWOOT SYNC] Token missing. Aborting.');
            return null;
        }

        const payload: any = { name };
        if (email) payload.email = email;
        if (phone) payload.phone_number = phone;

        // Search Contact First
        let existingId = null;
        try {
            const query = phone || email; // Prefer phone for search?
            if (query) {
                console.log(`[CHATWOOT SYNC] Searching for existing contact: ${query}`);
                const searchRes = await api.get(`/contacts/search`, { params: { q: query } });
                console.log(`[CHATWOOT SYNC] Search Result Count: ${searchRes.data.payload.length}`);

                if (searchRes.data.payload.length > 0) {
                    existingId = searchRes.data.payload[0].id;
                }
            }
        } catch (searchErr: any) {
            console.warn('[CHATWOOT SYNC] Search failed (ignoring):', searchErr.message);
        }

        if (existingId) {
            console.log(`[CHATWOOT SYNC] Updating existing contact ID: ${existingId}`);
            try {
                const update = await api.put(`/contacts/${existingId}`, payload);
                console.log(`[CHATWOOT SYNC] Update Success.`);
                return update.data.payload;
            } catch (updErr: any) {
                console.error('[CHATWOOT SYNC] Update failed:', updErr.response?.data || updErr.message);
            }
        }

        console.log(`[CHATWOOT SYNC] Creating OLD-SCHOOL new contact...`);
        try {
            const response = await api.post('/contacts', payload);
            console.log(`[CHATWOOT SYNC] Creation Success: ID ${response.data.payload.id}`);
            return response.data.payload;
        } catch (createErr: any) {
            // 422 usually means duplicate that search missed?
            console.error('[CHATWOOT SYNC] Creation Failed:', createErr.response?.data || createErr.message);
            // Dump full error for deep debug
            if (createErr.response) console.error('[CHATWOOT SYNC] Full Response:', JSON.stringify(createErr.response.data, null, 2));
            throw createErr;
        }

    } catch (error: any) {
        console.error('[CHATWOOT SYNC] FATAL ERROR:', error.response?.data || error.message);
        return null;
    }
};

export const getChatwootContacts = async (page = 1) => {
    try {
        if (!CHATWOOT_ACCESS_TOKEN) return [];
        const response = await api.get(`/contacts?page=${page}`);
        return response.data.payload; // Array of contacts
    } catch (error: any) {
        console.error('Error fetching Chatwoot contacts:', error.message);
        return [];
    }
};
