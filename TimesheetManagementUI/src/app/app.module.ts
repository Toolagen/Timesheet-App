import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { TimesheetEntryComponent } from './components/timesheet-entry/timesheet-entry.component';
import { WeeklyTimesheetEntryComponent } from './components/weekly-timesheet-entry/weekly-timesheet-entry.component';
import { TimesheetEntryReportComponent } from './components/timesheet-entry-report/timesheet-entry-report.component';
import { TimeAllocationDetailsComponent } from './components/time-allocation-details/time-allocation-details.component';
import { AddnewClientProjectComponent } from './components/addnew-client-project/addnew-client-project.component'

import { ProjectService } from './services/project.service';
import { JobService } from './services/job.service';
import { ClientService } from './services/client.service';
import { TimeAllocationService } from './services/time-allocation.service';
import { TimesheetService } from 'app/services/timesheet.service';
import { UserService } from 'app/services/user.service';
import { AuthenticationService } from 'app/services/authentication.service';

import { AuthGuard } from '../app/guards/auth.guard';
import { AdminAuthGuard } from '../app/guards/adminauth.guard';
import { EmployeesReportComponent } from './components/employees-report/employees-report.component';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },  
  { path: '', component: TimesheetEntryComponent, canActivate: [AuthGuard] },     
  { path: 'WeeklyTimesheetEntry', component: WeeklyTimesheetEntryComponent, canActivate: [AuthGuard]},
  // { path: 'WeeklyTimesheetEntry', component: TimesheetEntryComponent, canActivate: [AuthGuard]},
  { path: 'report', component: TimesheetEntryReportComponent, canActivate: [AdminAuthGuard]},
  { path: 'TimeAllocation', component: TimeAllocationDetailsComponent, canActivate: [AdminAuthGuard] },
  { path: 'Admin', component: AddnewClientProjectComponent, canActivate: [AdminAuthGuard] },
  {path:'EmployeesReport',component:EmployeesReportComponent,canActivate:[AdminAuthGuard]}
];

@NgModule({
  declarations: [
    AppComponent,
    TimesheetEntryComponent,
    LoginComponent,
    WeeklyTimesheetEntryComponent,
    TimesheetEntryReportComponent,    
    TimeAllocationDetailsComponent, 
    AddnewClientProjectComponent, EmployeesReportComponent,  
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,    
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  providers: [ClientService, ProjectService, JobService, TimesheetService, UserService, TimeAllocationService, AuthenticationService, AuthGuard, AdminAuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
