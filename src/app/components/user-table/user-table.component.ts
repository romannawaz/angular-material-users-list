import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DOCUMENT } from '@angular/common';

import { EMPTY, Subscription, fromEvent, switchMap, takeUntil } from 'rxjs';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { MatDialog } from '@angular/material/dialog';

import { IUser, UserRole } from '../../services/users/users.interface';
import { UsersService } from '../../services/users/users.service';

/** Dialogs */
import { TableColumnsDialog } from '../../dialogs/table-columns/table-columns.dialog';
import { ConfirmDialog } from '../../dialogs/confirm/confirm.dialog';
import { EditUserDialog } from '../../dialogs/edit-user/edit-user.dialog';

export interface TableColumnsConfig {
  title: Columm;
  isActive: boolean;
}

export type Columm = keyof IUser | 'edit' | 'delete';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserTableComponent implements OnInit, AfterViewInit, OnDestroy {
  private _subscription = new Subscription();

  @ViewChildren('mat_header', { read: ElementRef })
  headers!: QueryList<ElementRef>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  UserRole = UserRole;

  inlineEdit = true;
  isEdited = false;
  editedUser: IUser | null = null;

  userNameInput!: FormControl;
  userRolesInput!: FormGroup;

  private _defaultColumns: Columm[] = [
    'id',
    'userName',
    'email',
    'givenName',
    'familyName',
    'userRoles',
    'edit',
    'delete',
  ];

  dataSource: MatTableDataSource<IUser> = new MatTableDataSource();
  displayedColumns: Columm[] = [...this._defaultColumns];

  userNameFilter = new FormControl('');
  userRoleFilter = new FormControl('');

  constructor(
    public dialog: MatDialog,
    private userService: UsersService,
    private formBuilder: FormBuilder,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.updateUsers();
  }

  ngAfterViewInit(): void {
    this.headers.forEach((item) => this._move(item.nativeElement));
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

  saveUser(): void {
    if (!this.editedUser) return;

    const newUser = this.editedUser;
    newUser.userName = this.userNameInput.value;

    const rolesControl = this.userRolesInput.value;
    const roles: UserRole[] = [];
    for (let role in rolesControl)
      if (rolesControl[role]) roles.push(role as UserRole);

    newUser.userRoles = [...roles];

    this._subscription.add(
      this.userService.editUser(newUser).subscribe(() => {
        this.isEdited = false;
        this.editedUser = null;

        this.updateUsers();
      })
    );
  }

  editUser(user: IUser): void {
    if (this.inlineEdit) {
      this.isEdited = true;
      this.editedUser = user;

      this.userNameInput = this.formBuilder.control(
        user.userName,
        Validators.required
      );
      this.userRolesInput = this._createUserRoleForm(user);
    } else {
      const dialogRef = this.dialog.open(EditUserDialog, { data: user });

      this._subscription.add(
        dialogRef
          .afterClosed()
          .pipe(
            switchMap((user: IUser) => {
              if (user) {
                return this.userService.editUser(user);
              }

              return EMPTY;
            })
          )
          .subscribe(() => this.updateUsers())
      );
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

  private _createUserRoleForm(user: IUser): FormGroup {
    return this.formBuilder.group({
      [UserRole.User]: user.userRoles.includes(UserRole.User),
      [UserRole.Manager]: user.userRoles.includes(UserRole.Manager),
      [UserRole.Admin]: user.userRoles.includes(UserRole.Admin),
    });
  }

  private _move(element: HTMLElement) {
    const dragStart$ = fromEvent<MouseEvent>(element, 'mousedown');
    const dragEnd$ = fromEvent<MouseEvent>(this.document, 'mouseup');
    const drag$ = fromEvent<MouseEvent>(this.document, 'mousemove').pipe(
      takeUntil(dragEnd$)
    );

    let initialWidth: number = 0;

    let initialX: number;
    let currentX = 0;

    let dragSub: Subscription;

    const dragStartSub = dragStart$.subscribe((event: MouseEvent) => {
      if (!initialWidth) initialWidth = element.offsetWidth;

      initialX = event.clientX - currentX;

      dragSub = drag$.subscribe((event: MouseEvent) => {
        event.preventDefault();

        currentX = event.clientX - initialX;
        element.style.width = initialWidth + currentX + 'px';
      });
    });

    const dragEndSub = dragEnd$.subscribe(() => {
      initialX = currentX;

      if (dragSub) {
        dragSub.unsubscribe();
      }
    });

    this._subscription.add(dragStartSub);
    this._subscription.add(dragEndSub);
  }
}
