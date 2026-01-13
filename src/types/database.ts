export interface Raga {
    id: string;
    created_at: string;
    name: string;
    thaat: string; // e.g., Bilawal, Kalyan
    time: string; // e.g., Morning, Evening
    vadi: string;
    samvadi: string;
    aroha: string;
    avroha: string;
    pakad: string;
    description: string | null;
    user_id: string;
}

export interface Bandish {
    id: string;
    created_at: string;
    raga_id: string | null; // Changed to nullable
    title: string; // e.g., "Mero Man"
    type: 'khayal' | 'dhrupad' | 'thumri' | 'bhajan' | 'general_note' | 'other';
    tempo: 'vilambit' | 'madhya' | 'drut';
    tala: string; // e.g., Teentaal
    composer?: string; // e.g., "Sadarang"
    lyrics: string;
    audio_url: string | null;
    notation_image_url: string | null;
    user_id: string;
}

export interface DiaryEntry {
    id: string;
    created_at: string;
    title: string;
    content: string;
    image_url: string | null;
    user_id: string;
}

export interface Karyakram {
    id: string;
    created_at: string;
    title: string;
    date?: string;
    venue?: string;
    notes?: string;
    status: 'planned' | 'completed' | 'draft';
    user_id?: string;
}

export interface KaryakramItem {
    id: string;
    created_at: string;
    karyakram_id: string;
    bandish_id: string;
    sequence_order: number;
    notes?: string;
    bandish?: Bandish; // Joined data
}

// Helper types for UI
export type RagaInput = Omit<Raga, 'id' | 'created_at' | 'user_id'>;
export type BandishInput = Omit<Bandish, 'id' | 'created_at' | 'user_id'>;
export type DiaryInput = Omit<DiaryEntry, 'id' | 'created_at' | 'user_id'>;
export type KaryakramInput = Omit<Karyakram, 'id' | 'created_at' | 'user_id'>;
