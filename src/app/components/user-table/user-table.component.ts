import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';

import { EMPTY, Subscription, switchMap } from 'rxjs';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { MatDialog } from '@angular/material/dialog';

import { IUser } from '../../services/users/users.interface';
import { UsersService } from '../../services/users/users.service';

/** Dialogs */
import { TableColumnsDialog } from '../../dialogs/table-columns/table-columns.dialog';
import { ConfirmDialog } from '../../dialogs/confirm/confirm.dialog';

export interface TableColumnsConfig {
  title: Columm;
  isActive: boolean;
}

export type Columm = keyof IUser | 'delete';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
})
export class UserTableComponent implements OnInit, OnDestroy {
  private _subscription = new Subscription();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private _defaultColumns: Columm[] = [
    'id',
    'userName',
    'email',
    'givenName',
    'familyName',
    'userRoles',
    'delete',
  ];

  dataSource: MatTableDataSource<IUser> = new MatTableDataSource();
  displayedColumns: Columm[] = [...this._defaultColumns];

  userNameFilter = new FormControl('');
  userRoleFilter = new FormControl('');

  constructor(public dialog: MatDialog, private userService: UsersService) {}

  ngOnInit(): void {
    this.updateUsers();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  updateUsers(): void {
    this._subscription.add(
      this.userService.getUsers().subscribe((users) => {
        this.dataSource = new MatTableDataSource(users);

        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      })
    );
  }

  openTableColumnsDialog(): void {
    const tableColumnsConfig = this._defaultColumns.map((value) => {
      return {
        title: value,
        isActive: this.displayedColumns.includes(value),
      };
    });

    const dialogRef = this.dialog.open(TableColumnsDialog, {
      data: tableColumnsConfig,
    });

    this._subscription.add(
      dialogRef.afterClosed().subscribe((displayedColumns: Columm[]) => {
        if (!displayedColumns) return;

        this.displayedColumns = displayedColumns;
      })
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;

    const userNameFilter = this.userNameFilter.value?.toLowerCase().trim();
    const userRoleFilter = this.userRoleFilter.value?.toLowerCase().trim();

    this.dataSource.filterPredicate = function (data): boolean {
      return (
        (data.userName.toLowerCase().includes(userNameFilter ?? '') ||
          data.email.toLowerCase().includes(userNameFilter ?? '')) &&
        data.userRoles
          .join(' ')
          .toLocaleLowerCase()
          .includes(userRoleFilter ?? '')
      );
    };

    /**
     * TODO: trigger filter in other way
     */
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteUser(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialog);

    this._subscription.add(
      dialogRef
        .afterClosed()
        .pipe(
          switchMap((isConfirmed) => {
            if (isConfirmed) {
              return this.userService.deleteUser(id);
            }

            return EMPTY;
          })
        )
        .subscribe(() => this.updateUsers())
    );
  }
}
