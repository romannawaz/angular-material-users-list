import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { UserTableComponent } from './components/user-table/user-table.component';

/** Material */
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

const Material = [MatTableModule, MatPaginatorModule, MatSortModule];

@NgModule({
  declarations: [AppComponent, UserTableComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ...Material,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
