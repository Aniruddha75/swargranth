import { supabase } from '../lib/supabase';
import type { Raga, RagaInput, BandishInput } from '../types/database';

export const ragaService = {
    async createWithBandishes(raga: RagaInput, bandishes: BandishInput[]) {
        // 1. Transactional concept: Create Raga first
        const { data: ragaData, error: ragaError } = await this.create(raga);

        if (ragaError || !ragaData) {
            return { data: null, error: ragaError };
        }

        // 2. If Raga created, add Bandishes with the new Raga ID
        if (bandishes.length > 0) {
            if (!import.meta.env.VITE_SUPABASE_URL) {
                console.log('Mocking bandish insertion for:', bandishes);
                return { data: ragaData, error: null };
            }

            const bandishesToInsert = bandishes.map(b => ({
                ...b,
                raga_id: ragaData.id
            }));

            const { error: bandishError } = await supabase
                .from('bandishes')
                .insert(bandishesToInsert);

            if (bandishError) {
                console.error('Error adding bandishes:', bandishError);
                return { data: ragaData, error: { message: 'Raga created but failed to add bandishes' } };
            }
        }

        return { data: ragaData, error: null };
    },

    async getAll() {
        // Return mock data if no Supabase connection (for demo)
        if (!import.meta.env.VITE_SUPABASE_URL) {
            console.warn('Using mock data');
            return { data: MOCK_RAGAS, error: null };
        }
        return supabase.from('ragas').select('*').order('name');
    },

    async getById(id: string) {
        if (!import.meta.env.VITE_SUPABASE_URL) {
            const raga = MOCK_RAGAS.find(r => r.id === id);
            // Enrich mock data with mock bandishes if needed, or just return as is
            return { data: raga || null, error: null };
        }
        return supabase.from('ragas').select('*, bandishes(*)').eq('id', id).single();
    },

    async create(raga: RagaInput) {
        if (!import.meta.env.VITE_SUPABASE_URL) {
            console.error('Cannot create in mock mode');
            return { data: null, error: { message: 'Supabase not configured' } };
        }
        return supabase.from('ragas').insert(raga).select().single();
    },

    async delete(id: string) {
        return supabase.from('ragas').delete().eq('id', id);
    }
};

const MOCK_RAGAS: Raga[] = [
    {
        id: '1',
        created_at: new Date().toISOString(),
        name: 'Yaman',
        thaat: 'Kalyan',
        time: 'Evening (6 PM - 9 PM)',
        vadi: 'Ga',
        samvadi: 'Ni',
        aroha: 'Ni Re Ga Ma(t) Pa Dha Ni Sa',
        avroha: 'Sa Ni Dha Pa Ma(t) Ga Re Sa',
        pakad: 'Ni Re Ga Ma(t) Pa, Re Ga Re Sa',
        description: 'A fundamental raga of Kalyan thaat, very popular for beginners and concerts.',
        user_id: 'mock-user'
    },
    {
        id: '2',
        created_at: new Date().toISOString(),
        name: 'Bhairav',
        thaat: 'Bhairav',
        time: 'Morning (6 AM - 9 AM)',
        vadi: 'Dha',
        samvadi: 'Re',
        aroha: 'Sa Re(k) Ga Ma Pa Dha(k) Ni Sa',
        avroha: 'Sa Ni Dha(k) Pa Ma Ga Re(k) Sa',
        pakad: 'Ga Ma Dha(k) Dha(k) Pa, Ma Ga Re(k) Sa',
        description: 'One of the most ancient ragas, serious and devotional behavior.',
        user_id: 'mock-user'
    }
];
