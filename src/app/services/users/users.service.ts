import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IUser } from './users.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  /**
   * TODO: move this url to env file
   */
  private url = 'http://localhost:3000';

  private usersUrl = this.url + '/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.usersUrl);
  }

  createUser(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(this.usersUrl, user);
  }

  deleteUser(userId: string): Observable<IUser> {
    return this.http.delete<IUser>(`${this.usersUrl}/${userId}`);
  }
}
