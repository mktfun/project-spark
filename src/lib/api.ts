export const API_URL = '/api';

export const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('tork_token') : '';
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Stages
export const fetchStages = async () => {
    const res = await fetch(`${API_URL}/crm/stages/`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch stages');
    return res.json();
};

export const createStage = async (data: { name: string; slug: string; order?: number; color?: string }) => {
    const res = await fetch(`${API_URL}/crm/stages/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create stage');
    return res.json();
};

export const updateStage = async (id: number, data: { name?: string; order?: number; color?: string }) => {
    const res = await fetch(`${API_URL}/crm/stages/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update stage');
    return res.json();
};

export const deleteStage = async (id: number) => {
    const res = await fetch(`${API_URL}/crm/stages/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete stage');
    return res.json();
};

// Leads
export const fetchLeads = async () => {
    const res = await fetch(`${API_URL}/crm/leads`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch leads');
    return res.json();
};

export const updateLeadStatus = async (leadId: number, status: string) => {
    const res = await fetch(`${API_URL}/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update lead status');
    return res.json();
};
