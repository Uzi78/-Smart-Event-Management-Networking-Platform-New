
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORGANIZER = 'ORGANIZER',
  STAFF = 'STAFF',
  ATTENDEE = 'ATTENDEE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  industry?: string;
  interests?: string[];
  avatar?: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  location: string;
  organizerId: string;
  capacity: number;
  registeredCount: number;
  status: 'draft' | 'published' | 'live' | 'completed';
  revenue: number;
}

export interface Session {
  id: string;
  eventId: string;
  title: string;
  speaker: string;
  startTime: string;
  endTime: string;
  venue: string;
  capacity: number;
  tags: string[];
  registeredAttendees: string[];
}

export interface FloorPlanElement {
  id: string;
  type: 'booth' | 'seat' | 'stage' | 'entrance' | 'amenity' | 'obstacle';
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  assignedTo?: string; // Exhibitor ID or Attendee ID
  status: 'available' | 'reserved' | 'occupied';
}

export interface BadgeTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  elements: {
    type: 'text' | 'image' | 'qr';
    content: string;
    x: number;
    y: number;
    fontSize?: number;
    bold?: boolean;
  }[];
}

// Fix: Added missing AchievementBadge interface
export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  points: number;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}
