import { Event } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

export interface CreateEventPayload {
  name: string;
  startDate: string; // ISO string from date picker
  location: string;
  capacity: number;
  description?: string;
}

export interface AiNetworkingRecommendation {
  name: string;
  reason: string;
  starter: string;
  score: number;
  match: any;
}

export interface RagChatResponse {
  answer: string;
  source?: string | null;
  score: number;
  metadata: Record<string, any>;
}

const mapEventFromDto = (dto: any): Event => ({
  id: dto.id ?? dto._id,
  name: dto.name ?? dto.title ?? 'Untitled Event',
  description: dto.description ?? '',
  startDate: dto.start_date ?? dto.startDate ?? new Date().toISOString(),
  endDate: dto.end_date ?? dto.endDate ?? null,
  location: dto.location ?? 'TBD',
  organizerId: dto.organizer_id ?? dto.organizerId ?? 'u1',
  capacity: dto.capacity ?? 0,
  registeredCount: dto.registered_count ?? dto.registeredCount ?? 0,
  status: dto.status ?? 'draft',
  revenue: dto.revenue ?? 0,
});

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }
  return response.json() as Promise<T>;
};

export const api = {
  async getEvents(): Promise<Event[]> {
    const response = await fetch(`${API_BASE_URL}/api/events/`);
    const data = await handleResponse<any[]>(response);
    return data.map(mapEventFromDto);
  },

  async createEvent(payload: CreateEventPayload): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/api/events/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: payload.name,
        description: payload.description,
        start_date: new Date(payload.startDate).toISOString(),
        location: payload.location,
        organizer_id: 'u1',
        capacity: payload.capacity,
      }),
    });

    const data = await handleResponse<any>(response);
    return mapEventFromDto(data);
  },

  async getAiHealth(): Promise<{ ok: boolean; rag_backend: string }> {
    const response = await fetch(`${API_BASE_URL}/api/ai/health`);
    return handleResponse(response);
  },

  async getNetworkingRecommendations(user: any, attendees: any[], limit = 3): Promise<AiNetworkingRecommendation[]> {
    const response = await fetch(`${API_BASE_URL}/api/ai/networking/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user, attendees, limit }),
    });
    return handleResponse(response);
  },

  async ragChat(query: string, snapshot?: any): Promise<RagChatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/ai/rag/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, snapshot }),
    });
    return handleResponse(response);
  },
};
