import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import * as _ from 'underscore';

// Import required models
import { Timesheet } from 'app/models/timesheet';
import { User } from 'app/models/user';
import { TimesheetGrid } from 'app/models/timesheet-grid';

// Import required service
import { TimesheetService } from 'app/services/timesheet.service';
import { UserService } from 'app/services/user.service';
import { PagerService } from 'app/services/pager.service';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-employees-report',
  templateUrl: './employees-report.component.html',
  styleUrls: ['./employees-report.component.css'],
  providers: [TimesheetService, UserService, PagerService],
})
export class EmployeesReportComponent implements OnInit {

  public loadingUsers: boolean;

  // Declare global variables
  public users: User[];
  public AllUsers: User[];
  public timesheets: TimesheetGrid[];
  public today: string;
  public ShowTimesheetData: boolean;
  public errorMessage: string;
  public successMessage: string;
  public loadingTimesheets: boolean;
  public loggedInUserEmail: string = JSON.parse(localStorage.getItem('currentUser')).username;
  public timesheet = new Timesheet(null, null, null, null, false, null, null, null, null, null);

  // pager object
  pager: any = {};
  pagedItems: any[];
  ExistJObId: number;
  loading: boolean;
  updating: boolean;

  // Create instance of required services through dependency injection 
  constructor(
    private timesheetService: TimesheetService,
    private userService: UserService,
    private http: Http,
    private pagerService: PagerService,
  ) { }

  ngOnInit() {
    this.today = this.formatDate(new Date());
    this.timesheet.Date = this.today;
    this.getUserByEmail(this.loggedInUserEmail);
    this.getAllUsers();
    this.getUserTimesheetDataByDate(this.timesheet.Date); 
  }

  getAllUsers() {
    this.loadingUsers = true;
    this.userService.getAllUsers()
      .subscribe(
        data => {
          this.AllUsers = data;
          this.loadingUsers = false;
        },
        error => {
          this.loadingUsers = false;
          this.errorMessage = "";
        }
      );
  }

  getUserByEmail(email) {
    this.userService.getUserByEmail(email)
      .subscribe(
        data => {
          this.timesheet.CreatedId = data[0].Id;
          this.getUserTimesheetDataByDate(this.timesheet.Date);
        },
        error => {
          this.errorMessage = "";
        }
      );
  }

  getUserTimesheetDataByDate(workdate) {
    this.loading = true;
    this.timesheetService.getTimeSheetGridDataByDate(workdate)
      .subscribe(
        data => {
          this.timesheets = data;
          this.loading = false;
          const filledUserIds = this.timesheets.map(ts => ts.UserId);
          this.users = this.AllUsers.filter(user => !filledUserIds.includes(user.id));
  
          if (this.timesheets.length) {
            this.ShowTimesheetData = true;
          } else {
            this.ShowTimesheetData = false;
          }
  
          this.pager = {};
          this.setPage(1);
        },
        error => {
          this.loading = false;
          this.errorMessage = "";
        }
      );
  }
  

  // Helper methods
  clearTimesheetForm() {
    this.timesheet = new Timesheet(null, this.timesheet.Date, null, '', false, this.timesheet.CreatedId, null, null, null, null);
  }

  formatDate(date) {
    if (date != null && date != "") {
      const day = date.getDate();
      const monthIndex = date.getMonth() + 1; // Months are zero-based
      const year = date.getFullYear();

      return `${year}-${monthIndex.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    } else {
      return null;
    }
  }

  clearValidationErrors() {
    if (this.timesheet.Date > this.today) {
      this.timesheet.Date = this.today;
      this.getUserTimesheetDataByDate(this.timesheet.Date);
    }
  }

  setPage(page: number) {
    if (page < 1 || page > this.pager.totalPages) {
      return;
    }

    // get pager object from service
    this.pager = this.pagerService.getPager(this.timesheets.length, page);

    // get current page of items
    this.pagedItems = this.timesheets.slice(this.pager.startIndex, this.pager.endIndex + 1);

  }
}
