import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuStudentRoutingModule } from './menu-student-routing.module';
import { MenuStudentComponent } from './menu-student.component';
import {MatButtonModule} from '@angular/material/button';
import {_MatMenuDirectivesModule} from '@angular/material/menu';
import {MenuItemModule} from '../menu-item/menu-item.module';


@NgModule({
  declarations: [
    MenuStudentComponent
  ],
  exports: [
    MenuStudentComponent
  ],
  imports: [
    CommonModule,
    MenuStudentRoutingModule,
    MatButtonModule,
    _MatMenuDirectivesModule,
    MenuItemModule
  ]
})
export class MenuStudentModule { }
