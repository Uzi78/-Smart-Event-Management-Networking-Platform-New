
import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Map, 
  Settings, 
  MessageSquare, 
  Network, 
  IdCard
} from 'lucide-react';
import { UserRole, AchievementBadge } from './types';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: [UserRole.ORGANIZER, UserRole.SUPER_ADMIN] },
  { id: 'events', label: 'Events', icon: <Calendar size={20} />, roles: [UserRole.ORGANIZER, UserRole.ATTENDEE] },
  { id: 'venue', label: 'Venue Manager', icon: <Map size={20} />, roles: [UserRole.ORGANIZER] },
  { id: 'networking', label: 'AI Networking', icon: <Network size={20} />, roles: [UserRole.ATTENDEE, UserRole.ORGANIZER] },
  { id: 'sessions', label: 'Sessions', icon: <Calendar size={20} />, roles: [UserRole.ATTENDEE] },
  { id: 'attendees', label: 'Attendees', icon: <Users size={20} />, roles: [UserRole.ORGANIZER, UserRole.STAFF] },
  { id: 'badges', label: 'Badges', icon: <IdCard size={20} />, roles: [UserRole.ORGANIZER] },
  { id: 'assistant', label: 'AI Assistant', icon: <MessageSquare size={20} />, roles: [UserRole.ATTENDEE, UserRole.ORGANIZER] },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, roles: [UserRole.ATTENDEE, UserRole.ORGANIZER] },
];

export const MOCK_USER = {
  id: 'u1',
  name: 'Alex Rivera',
  email: 'alex@example.com',
  role: UserRole.ORGANIZER,
  company: 'TechFlow Inc.',
  industry: 'Software Engineering',
  interests: ['AI', 'PWA', 'React', 'Cloud Native'],
  avatar: 'https://picsum.photos/seed/alex/200'
};

export const MOCK_EVENTS = [
  {
    id: 'e1',
    name: 'Future Tech Expo 2025',
    description: 'The premier event for emerging technologies and innovation.',
    startDate: '2025-09-15T09:00:00.000Z',
    location: 'Convention Center, San Francisco',
    organizerId: 'u1',
    capacity: 1000,
    registeredCount: 842,
    status: 'published' as const,
    revenue: 125000
  },
  {
    id: 'e2',
    name: 'Global Dev Summit',
    description: 'Connecting developers from across the globe.',
    startDate: '2025-11-02T09:00:00.000Z',
    location: 'Remote / Virtual',
    organizerId: 'u1',
    capacity: 5000,
    registeredCount: 1200,
    status: 'draft' as const,
    revenue: 45000
  }
];

// Fix: Added missing MOCK_ACHIEVEMENTS data
export const MOCK_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'ach-1',
    name: 'Networking Guru',
    description: 'Connect with 5 other attendees using AI matching.',
    requirement: '5 Connections',
    points: 100,
    icon: 'Network',
    rarity: 'Rare'
  },
  {
    id: 'ach-2',
    name: 'Early Arrival',
    description: 'Be one of the first 100 people at the venue.',
    requirement: 'Morning Check-in',
    points: 50,
    icon: 'Zap',
    rarity: 'Common'
  },
  {
    id: 'ach-3',
    name: 'Session Master',
    description: 'Attend at least 3 high-tech sessions.',
    requirement: '3 Sessions',
    points: 150,
    icon: 'Calendar',
    rarity: 'Epic'
  }
];
