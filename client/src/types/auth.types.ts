export interface UserReminderSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  reminderHoursBefore: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  reminderSettings: UserReminderSettings;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserProfileResponse {
  user: User;
  stats: {
    upcomingEvents: number;
    pastEvents: number;
    totalEvents: number;
    invitesCreated: number;
    friendsReferredClicks: number;
  };
}
