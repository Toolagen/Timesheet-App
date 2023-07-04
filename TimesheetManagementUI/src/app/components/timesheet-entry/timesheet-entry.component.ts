import { Component, OnInit, NgZone, transition } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import * as _ from 'underscore';

// Import required models
import { Client } from 'app/models/client';
import { Project } from 'app/models/project';
import { Job } from 'app/models/job';
import { Timesheet } from 'app/models/timesheet';
import { User } from 'app/models/user';
import { TimesheetGrid } from 'app/models/timesheet-grid';

// Import required service
import { ClientService } from 'app/services/client.service';
import { ProjectService } from 'app/services/project.service';
import { JobService } from 'app/services/job.service';
import { TimesheetService } from 'app/services/timesheet.service';
import { UserService } from 'app/services/user.service';
import { PagerService } from 'app/services/pager.service';


@Component({
  selector: 'app-timesheet-entry',
  templateUrl: './timesheet-entry.component.html',
  styleUrls: ['./timesheet-entry.component.css'],
  providers: [ClientService, ProjectService, JobService, TimesheetService, UserService, PagerService],
})
export class TimesheetEntryComponent implements OnInit {
  // Declare global variables
  public showLoadingGreeting: boolean = true;
  public allClients: Client[];
  public clients: Client[];
  public allProjects: Project[];
  public projects: Project[];
  public alljobs: Job[];
  public jobs: Job[];
  public users: User[];
  public timesheets: TimesheetGrid[];
  public today: string;
  public ShowTimesheetData: boolean;
  public errorMessage: string;
  public validationErrorHour: string;
  public validationErrorDate: string;
  public validationErrorClient: string;
  public validationErrorProject: string;
  public validationErrorJob: string;
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
  public formattedName: string; 


  // Create instance of required services through dependency injection 
  constructor(
    private clientService: ClientService,
    private projectService: ProjectService,
    private jobService: JobService,
    private timesheetService: TimesheetService,
    private userService: UserService,
    private http: Http,
    private pagerService: PagerService,
  ) { }

  // Load projects and jobs data on page load using ngOnInit
  ngOnInit() {
    this.today = this.formatDate(new Date(Date.now()));
    this.timesheet.Date = this.today;
    this.getClients();
    this.getProjects();
    this.getJobs();
    this.getUserByEmail(this.loggedInUserEmail);
    setTimeout(() => {
      this.showLoadingGreeting = false;
    }, 2000);
    const email = JSON.parse(localStorage.getItem('currentUser')).username;
    const name = email.substring(0, email.indexOf('@'));
    this.formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  getUserByEmail(email) {
    this.userService.getUserByEmail(email)
      .subscribe(
        data => {
          this.timesheet.CreatedId = data[0].Id;
          this.getUserTimesheetDataByDate(this.timesheet.Date);
        },
        error => this.errorMessage = ""
      );
  }

  getClients() {    
    this.clientService.getAllClients()
      .subscribe(
        data => {
          this.allClients = data;
          this.clients = this.allClients.filter(c => c.StatusId == 1);          
        },
        error => { this.errorMessage = "" });
  }

  getProjects() {
    this.projectService.getAllProjects()
      .subscribe(
        data => {
          this.projects = data;
          
        },
        error => this.errorMessage = "");
  }

  getJobs() {
    this.jobService.getAllJobs()
      .subscribe(
        data => {
          this.jobs = data;
        },
        error => this.errorMessage = "");
  }

  public onClientChange(): void {
    this.timesheet.ProjectId = null;
    this.timesheet.JobId = null;
  }

  public onProjectChange(): void {
    this.timesheet.JobId = null;
  }

  public onJobChange(newJobId) {
    this.timesheet.JobId = newJobId;
    for(let i=0; i<this.jobs.length; i++) {
      if(this.jobs[i].Id == newJobId){
        this.timesheet.IsBillable = this.jobs[i].IsBillable;
      }
    }    
  }

  getUserTimesheetDataByDate(workdate) {
    this.loading = true;
    this.timesheetService.getTimeSheetGridDataByDate(workdate)
      .subscribe(
        data => {
          this.timesheets = data.filter(c => c.UserId == this.timesheet.CreatedId);
          this.loading = false;
          if (this.timesheets.length)
            this.ShowTimesheetData = true;
          else this.ShowTimesheetData = false;
          this.pager = {};
          this.setPage(1);
        },
        error => {
          this.loading = false;
          this.errorMessage = "";
        });
  }

  // Save timesheet data into database
  onTimesheetSubmit() {
    if (this.validateForm()) {
      this.updating = true;
      this.timesheet.Comments = this.timesheet.Comments ? this.timesheet.Comments : '';
      this.timesheetService.addTimesheet(this.timesheet)
        .then(
          data => {
            if (data) {
              this.getUserTimesheetDataByDate(this.timesheet.Date);
              if (this.timesheet.Id) {
                this.updating = false;
                this.successMessage = "Timesheet data updated";
              }
              else {
                this.updating = false;
                this.successMessage = "Timesheet data added";
              }
              this.clearTimesheetForm();
              setTimeout(() => {
                this.successMessage = "";
              }, 3000);
            }
            else {
              this.errorMessage = "Duplicate Entry, Data cannot be Updated";
              setTimeout(() => {
                this.errorMessage = "";
              }, 3000);
              this.updating = false;
            }
          },
          error => {
            this.errorMessage = "Error while adding Timesheet data";
            setTimeout(() => {
              this.errorMessage = "";
            }, 3000);
            this.updating = false;
          });
    }
  }

  EditTimesheet(timesheet) {
    if (confirm("Do you want to edit?")) {
      this.clearValidationErrors();
      this.timesheet = new Timesheet(timesheet.Id, this.formatDate(new Date(timesheet.WorkDate)), timesheet.WorkHour, timesheet.Comments, timesheet.IsBillable,
        timesheet.UserId, timesheet.UserId, timesheet.ProjectId, timesheet.JobId, timesheet.ClientId);
    }
  }

  CancelEdit() {
    this.clearTimesheetForm();
    this.clearValidationErrors();
  }

  DeleteTimesheet(id) {
    if (confirm("Are you sure to delete this item?")) {
      this.timesheetService.deleteTimeSheetEntry(id)
        .then(
          data => {
            if (data) {
              this.getUserTimesheetDataByDate(this.timesheet.Date);
              this.clearTimesheetForm();
              this.successMessage = "Timesheet entry deleted";
            } else {
              this.errorMessage = "Error while deleting timesheet entry";
            }
            setTimeout(() => {
              this.successMessage = "";
              this.errorMessage = "";
            }, 3000);
          },
          error => {
            this.errorMessage = "Error while deleting timesheet entry";
            setTimeout(() => {
              this.successMessage = "";
              this.errorMessage = "";
            }, 3000);
          });
    }
  }

  RemoveCommentWhiteSpaces() {
    this.timesheet.Comments = this.timesheet.Comments != null ? this.timesheet.Comments.replace(/\s+/g, ' ') : null;
  }

  // Helper methods
  clearTimesheetForm() {
    this.timesheet = new Timesheet(null, this.timesheet.Date, null, '', false, this.timesheet.CreatedId, null, null, null, null);
  }

  formatDate(date) {
    if (date != null && date != "") {
      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();

      return year + '-' + (monthIndex < 9 ? '0' + (monthIndex + 1) : (monthIndex + 1)) + '-' + (day <= 9 ? '0' + day : day);
    }
    else {
      return null;
    }
  }

  validateForm() {
    let dateValidated = false;
    let hourValidated = false;
    let clientValidated = false;
    let projectValidated = false;
    let jobValidated = false;

    if (!this.timesheet.ClientId) {
      this.validationErrorClient = "Client is required";
      clientValidated = false;
    } else {
      clientValidated = true;
      this.validationErrorClient = "";
    }

    if (!this.timesheet.ProjectId) {
      this.validationErrorProject = "Project is required";
      projectValidated = false;
    } else {
      projectValidated = true;
      this.validationErrorProject = "";
    }

    if (!this.timesheet.Hours) {
      this.validationErrorHour = "Hour is required";
      hourValidated = false;
    }
    else if (this.timesheet.Hours <= 0 || this.timesheet.Hours > 24) {
      this.validationErrorHour = "Hour should be greater than zero and less than 24";
      hourValidated = false;
    }
    else if (!/^(\d{0,2}(\.\d{1})?)$/.test(this.timesheet.Hours.toString())) {
      this.validationErrorHour = "Hour should only contain one decimal digit";
      hourValidated = false;
    } else if (this.UserWorkHours() > 24) {
      this.validationErrorHour = "Maximum 24 hours allowed to enter in a day";
      hourValidated = false;
    } else {
      hourValidated = true;
      this.validationErrorHour = "";
    }
    if (!this.timesheet.JobId) {
      this.validationErrorJob = "Job is required";
      jobValidated = false;
    }
    else {
      jobValidated = true;
      this.validationErrorJob = "";
    }
    if (!this.timesheet.Date) {
      this.validationErrorDate = "Date is required";
      dateValidated = false;
    }
    else if (this.timesheet.Date > this.today) {
      this.validationErrorDate = "Date should not be greater than today";
      dateValidated = false;
    }
    else {
      this.validationErrorDate = "";
      dateValidated = true;
    }

    return clientValidated && projectValidated && jobValidated && dateValidated && hourValidated;
  }

  clearValidationErrors() {
    if (this.timesheet.Date > this.today) {
      this.timesheet.Date = this.today;
      this.getUserTimesheetDataByDate(this.timesheet.Date);
    }
    this.validationErrorHour = "";
    this.validationErrorDate = "";
    this.validationErrorClient = "";
    this.validationErrorProject = "";
    this.validationErrorJob = "";
  }

  UserWorkHours(): number {
    try {
      var totalHours: number = this.timesheet.Hours;
      var userTimesheets = this.timesheets.filter(c => c.UserId == this.timesheet.CreatedId && c.Id != this.timesheet.Id);
      userTimesheets.forEach(element => {
        totalHours = totalHours + element.WorkHour;
      });
      return totalHours;
    }
    catch (Exception) {
      return null;
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
