import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { UserTableComponent } from './components/user-table/user-table.component';
import { TableColumnsDialog } from './dialogs/table-columns/table-columns.dialog';
import { ConfirmDialog } from './dialogs/confirm/confirm.dialog';
import { EditUserDialog } from './dialogs/edit-user/edit-user.dialog';

/** Material */
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

const Material = [
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatDialogModule,
  MatCheckboxModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
];

@NgModule({
  declarations: [
    AppComponent,
    UserTableComponent,
    TableColumnsDialog,
    ConfirmDialog,
    EditUserDialog,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ...Material,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
