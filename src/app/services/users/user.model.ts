import { IUser, UserRole } from './users.interface';

export class User implements IUser {
  constructor(
    public id = Date.now().toString(),
    public userName: string,
    public email: string,
    public userRoles: UserRole[],
    public givenName?: string,
    public familyName?: string
  ) {}
}
