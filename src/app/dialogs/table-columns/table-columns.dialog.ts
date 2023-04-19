import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { IUser } from '../../services/users/users.interface';
import { TableColumnsConfig } from '../../components/user-table/user-table.component';

@Component({
  selector: 'app-table-columns',
  templateUrl: './table-columns.dialog.html',
  styleUrls: ['./table-columns.dialog.scss'],
})
export class TableColumnsDialog implements OnInit {
  form!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<TableColumnsDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: TableColumnsConfig[],
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this._createForm();
  }

  saveChanges(): void {
    const data = Object.keys(this.form.value).filter(
      (item) => this.form.value[item as keyof IUser]
    );

    this.dialogRef.close(data);
  }

  private _createForm(): FormGroup {
    const form = this.formBuilder.group({});

    for (let column of this.data) {
      form.addControl(column.title, this.formBuilder.control(column.isActive));
    }

    return form;
  }
}
