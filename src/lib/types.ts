export type Review = {
  id?: string;
  author: string;
  avatarUrl: string;
  rating: number;
  text: string;
  date: string;
  raceId?: string;
};

export type Race = {
  id: string;
  name: string;
  latestRace?: boolean;
};

// Better Auth types
export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  user: User;
};
