import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { IUser } from '../../services/users/users.interface';
import { UsersService } from '../../services/users/users.service';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
})
export class UserTableComponent implements OnInit, OnDestroy {
  private _subscription = new Subscription();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource: MatTableDataSource<IUser> = new MatTableDataSource();
  displayedColumns: Array<keyof IUser> = [
    'id',
    'userName',
    'email',
    'givenName',
    'familyName',
    'userRoles',
  ];

  constructor(private userService: UsersService) {}

  ngOnInit(): void {
    this._subscription.add(
      this.userService.getUsers().subscribe((users) => {
        this.dataSource = new MatTableDataSource(users);

        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      })
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
