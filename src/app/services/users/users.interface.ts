export interface IUser {
  id: string;
  userName: string;
  email: string;
  givenName?: string;
  familyName?: string;
  userRoles: UserRole[];
}

export enum UserRole {
  User,
  Manager,
  Admin,
}
