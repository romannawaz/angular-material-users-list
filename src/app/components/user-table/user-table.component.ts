import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { MatDialog } from '@angular/material/dialog';

import { IUser } from '../../services/users/users.interface';
import { UsersService } from '../../services/users/users.service';

/** Dialogs */
import { TableColumnsDialog } from '../../dialogs/table-columns/table-columns.dialog';

export interface TableColumnsConfig {
  title: keyof IUser;
  isActive: boolean;
}

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
})
export class UserTableComponent implements OnInit, OnDestroy {
  private _subscription = new Subscription();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private _defaultColumns: Array<keyof IUser> = [
    'id',
    'userName',
    'email',
    'givenName',
    'familyName',
    'userRoles',
  ];

  dataSource: MatTableDataSource<IUser> = new MatTableDataSource();
  displayedColumns: Array<keyof IUser> = [...this._defaultColumns];

  constructor(public dialog: MatDialog, private userService: UsersService) {}

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

  openTableColumnsDialog(): void {
    const tableColumnsConfig: TableColumnsConfig[] = this._defaultColumns.map(
      (value) => {
        return {
          title: value,
          isActive: this.displayedColumns.includes(value),
        };
      }
    );

    const dialogRef = this.dialog.open(TableColumnsDialog, {
      data: tableColumnsConfig,
    });

    this._subscription.add(
      dialogRef.afterClosed().subscribe((displayedColumns) => {
        if (!displayedColumns) return;

        this.displayedColumns = displayedColumns as Array<keyof IUser>;
      })
    );
  }
}
