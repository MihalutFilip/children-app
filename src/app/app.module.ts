import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HistoryComponent } from './history/history.component';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { ButtonModule } from 'primeng/button';
import { MatPaginatorModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatRippleModule, MatNativeDateModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { LessonModalComponent } from './modals/lesson-modal/lesson-modal.component';
import { ConfirmationDialogService } from './modals/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationDialogComponent } from './modals/confirmation-dialog/confirmation-dialog.component';
import { ToastModule } from 'primeng/toast';
import { GroupsComponent } from './groups/groups.component';
import { HomeComponent } from './home/home.component';
import { ChildrenComponent } from './groups/children/children.component';
import { AvatarModule } from 'ngx-avatar';
import { HttpClientModule } from  '@angular/common/http';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { GroupModalComponent } from './modals/group-modal/group-modal.component';
import { ChildModalComponent } from './modals/child-modal/child-modal.component';
import { ScoresModalComponent } from './modals/scores-modal/scores-modal.component';
import { CustomFieldModalComponent } from './modals/custom-field-modal/custom-field-modal.component';
import { ReportsComponent } from './reports/reports.component';
import { ChartComponent } from './reports/chart/chart.component';

@NgModule({
  declarations: [
    AppComponent,
    HistoryComponent,
    LessonModalComponent,
    ConfirmationDialogComponent,
    GroupsComponent,
    HomeComponent,
    ChildrenComponent,
    GroupModalComponent,
    ChildModalComponent,
    ScoresModalComponent,
    CustomFieldModalComponent,
    ReportsComponent,
    ChartComponent  
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    AccordionModule,
    BrowserAnimationsModule,
    TableModule,
    TabViewModule,
    MatTabsModule,
    ButtonModule,
    MatTableModule,
    MatPaginatorModule,
    NgbModule,
    MatDatepickerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatNativeDateModule,
    DropdownModule,
    FormsModule,
    ToastModule,
    AvatarModule,
    NgMultiSelectDropDownModule
  ],
  providers: [
    ConfirmationDialogService
  ],
  exports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DropdownModule,
    AvatarModule,
    NgMultiSelectDropDownModule
  ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmationDialogComponent]
})
export class AppModule { }
