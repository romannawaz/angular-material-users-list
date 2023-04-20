import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { IUser, UserRole } from '../../services/users/users.interface';
import { User } from '../../services/users/user.model';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.dialog.html',
  styleUrls: ['./edit-user.dialog.scss'],
})
export class EditUserDialog implements OnInit {
  form!: FormGroup;

  UserRole = UserRole;

  constructor(
    public dialogRef: MatDialogRef<EditUserDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: IUser,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this._createForm();
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    const { userName, email, givenName, familyName } = this.form.value;
    const rolesControl = this.form.controls['role'].value;

    const roles: UserRole[] = [];
    for (let role in rolesControl)
      if (rolesControl[role]) roles.push(role as UserRole);

    const newUser = new User(
      this.data.id,
      userName,
      email,
      roles,
      givenName,
      familyName
    );

    this.dialogRef.close(newUser);
  }

  private _createForm(): FormGroup {
    return this.formBuilder.group({
      userName: [this.data.userName, Validators.required],
      email: [this.data.email, Validators.required],
      givenName: this.data.givenName ?? '',
      familyName: this.data.familyName ?? '',
      role: this.formBuilder.group({
        [UserRole.User]: this.data.userRoles.includes(UserRole.User),
        [UserRole.Manager]: this.data.userRoles.includes(UserRole.Manager),
        [UserRole.Admin]: this.data.userRoles.includes(UserRole.Admin),
      }),
    });
  }
}
