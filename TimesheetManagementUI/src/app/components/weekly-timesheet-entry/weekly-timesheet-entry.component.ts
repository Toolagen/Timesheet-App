import { Component, OnInit } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import * as moment from 'moment/moment';
import * as _ from 'underscore';

//import modules 
import { WeeklyTimeSheetDisplay } from 'app/models/weeklyTimeSheetDisplay';
import { Timesheet } from 'app/models/timesheet';
import { Client } from 'app/models/client';
import { Project } from 'app/models/project';
import { Job } from 'app/models/job';

//import the services
import { TimesheetService } from 'app/services/timesheet.service';
import { UserService } from 'app/services/user.service';
import { JobService } from 'app/services/job.service';
import { ProjectService } from 'app/services/project.service';
import { ClientService } from 'app/services/client.service';

@Component({
  selector: 'app-weekly-timesheet-entry',
  templateUrl: './weekly-timesheet-entry.component.html',
  styleUrls: ['./weekly-timesheet-entry.component.css'],
  providers: [TimesheetService, UserService, JobService, ProjectService, ClientService]
})
export class WeeklyTimesheetEntryComponent implements OnInit {
  /* Declare global variables*/
  public FromDate: string;
  public ToDate: string;
  public today: string;

  public jobs: Job[];
  public projects: Project[];
  public allClients: Client[];
  public clients: Client[];
  public timesheetdisplay: WeeklyTimeSheetDisplay[];
  public NewlyEnteredItems: WeeklyTimeSheetDisplay[];
  public CompareTimesheet: WeeklyTimeSheetDisplay[];
  public errorMessage: string;
  public successMessage: string;
  public CreatedId: number;
  public alertClass: string;
  public icon: string;
  public EventValue: number;
  public EventKey: string;
  public loader: number;
  public TotalHoursCount: number;
  public NoData: boolean;
  public loadingProjects: boolean;
  public dataUpdate: boolean;
  public loadingTimesheets: boolean;
  public deleteTimesheets: boolean;
  public NextWeekDate: boolean;
  public loadingCount: boolean;
  public weekValues: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  public WeekObjectProperties: string[] = ["ClientId", "ProjectId", "JobId", "Comments", "IsBillable"];
  public TotalWeeklyHours: any = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };
  public loggedInUserEmail: string = JSON.parse(localStorage.getItem('currentUser')).username;
  public timesheet = new Timesheet(null, null, null, null, false, null, null, null, null, null);

  public newClientErrorHighlight: number[] = [];
  public newProjectErrorHighlight: number[] = [];
  public newJobErrorHighlight: number[] = [];
  public existingProjectErrorHighlight: number[] = [];
  public existingJobErrorHighlight: number[] = [];
  public duplicateErrorHighlight: number[] = [];
  public newduplicateErrorHighlight: number[] = [];

  /* Create instance of required services through dependency injection */
  constructor(
    private http: Http,
    private userService: UserService,
    private timesheetService: TimesheetService,
    private jobService: JobService,
    private projectService: ProjectService,
    private clientService: ClientService
  ) {
    this.NewlyEnteredItems = [];
  }

  /* Load projects,jobs and Today date data on page load using ngOnInit */
  ngOnInit() {
    var startOfWeek = moment().startOf('week').add(1, 'day').toDate();
    var endOfWeek = moment().endOf('week').add(1, 'day').toDate();
    this.today = this.formatDate(new Date(Date.now()));
    this.FromDate = this.formatDate(new Date(startOfWeek));
    this.ToDate = this.formatDate(new Date(endOfWeek));
    this.getUserByEmailID(this.loggedInUserEmail);
    this.getClients();
    this.getProjects();
    this.getJobs();

    this.loadingTimesheets = true;
    this.NextWeekDate = true;
    this.loadingCount = true;
  }

  getUserByEmailID(email) {
    this.userService.getUserByEmail(email)
      .subscribe(
        data => {
          this.CreatedId = data[0].Id;
          this.getUserWeeklyTimesheetData(this.FromDate, this.CreatedId);
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
        error => this.errorMessage = "");
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

  onJobChange(newJobId, value) {
    for(let i=0; i<this.jobs.length; i++) {
      if(this.jobs[i].Id == newJobId){
        this.timesheetdisplay[value].IsBillable = this.jobs[i].IsBillable;
      }
    }
  }

  onNewJobChange(newJobId, value) {
    for(let i=0; i<this.jobs.length; i++) {
      if(this.jobs[i].Id == newJobId){
        this.NewlyEnteredItems[value].IsBillable = this.jobs[i].IsBillable;
      }
    }
  }

  getUserWeeklyTimesheetData(fromdate, createdId) {
    this.loadingTimesheets = true;
    var date1 = Date.parse(this.ToDate);
    var date2 = Date.parse(this.today);
    if (date1 > date2) {
      this.NextWeekDate = true;
    }
    else {
      this.NextWeekDate = false;
    }
    this.timesheetService.getUserWeeklyTimesheetData(fromdate, createdId)
      .subscribe(
        data => {
          this.timesheetdisplay = data;
          this.CompareTimesheet = JSON.parse(JSON.stringify(data));
          if (this.timesheetdisplay.length) {
            this.NoData = false;
          }
          else {
            this.NoData = true;
            this.timesheetdisplay = [];
          }
          this.TotalHours();
        },
        error => {
          this.errorMessage = " ";
          this.loadingTimesheets = false;
        });
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

  public previousweek(): void {
    this.FromDate = moment(this.FromDate).subtract(1, 'week').format('YYYY-MM-DD').toString();
    this.ToDate = moment(this.ToDate).subtract(1, 'week').format('YYYY-MM-DD').toString();
    this.NewlyEnteredItems = [];
    this.getUserWeeklyTimesheetData(this.FromDate, this.CreatedId);
  }

  public nextweek(): void {
    this.FromDate = moment(this.FromDate).add(1, 'week').format('YYYY-MM-DD').toString();
    this.ToDate = moment(this.ToDate).add(1, 'week').format('YYYY-MM-DD').toString();
    this.NewlyEnteredItems = [];
    this.getUserWeeklyTimesheetData(this.FromDate, this.CreatedId);
  }

  public TotalHours(): void {
    let Count: number[] = [];
    this.TotalHoursCount = 0;
    for (let index = 0; index < this.weekValues.length; index++) {
      this.TotalWeeklyHours[this.weekValues[index]] = 0;
      this.timesheetdisplay.forEach(element => {
        this.TotalWeeklyHours[this.weekValues[index]] = this.TotalWeeklyHours[this.weekValues[index]] + element[this.weekValues[index]][0].Hours;
      });
      this.NewlyEnteredItems.forEach(element => {
        this.TotalWeeklyHours[this.weekValues[index]] = this.TotalWeeklyHours[this.weekValues[index]] + element[this.weekValues[index]][0].Hours;
      });
      Count.push(this.TotalWeeklyHours[this.weekValues[index]]);
    }

    for (let index = 0; index < Count.length; index++) {
      this.TotalHoursCount = this.TotalHoursCount + Count[index];
    }
    this.loadingTimesheets = false;
  }

  public TotalHoursByWeek(week: string): void {
    this.TotalWeeklyHours[week] = 0;
    this.timesheetdisplay.forEach(element => {
      this.TotalWeeklyHours[week] = this.TotalWeeklyHours[week] + element[week][0].Hours;
    });
    this.NewlyEnteredItems.forEach(element => {
      this.TotalWeeklyHours[week] = this.TotalWeeklyHours[week] + element[week][0].Hours;
    });
  }

  public HourChange(value: number, week: string, event: any): void {

    if (!event.target.value && this.EventKey == ".") {
      this.timesheetdisplay[value][week][0].Hours = this.EventValue;
    }
    else {
      this.TotalHoursByWeek(week);
      if (this.TotalWeeklyHours[week] > 24) {
        event.target.value = 24 - this.TotalWeeklyHours[week] + this.timesheetdisplay[value][week][0].Hours;
        this.timesheetdisplay[value][week][0].Hours = Math.round((24 - this.TotalWeeklyHours[week] + this.timesheetdisplay[value][week][0].Hours) * 100) / 100;
        this.showAlertMsg("alert-danger", "Total Hours should not exceed 24, Maximum value that can be entered is " + this.timesheetdisplay[value][week][0].Hours, "glyphicon-alert");
      }
      this.TotalHoursByWeek(week);
    }
    this.EventValue = 0;
    this.EventKey = '';
  }

  public NewHourChange(value: number, week: string, event: any): void {
    if (!event.target.value && this.EventKey == ".") {
      this.NewlyEnteredItems[value][week][0].Hours = this.EventValue;
    }
    else {
      this.TotalHoursByWeek(week);
      if (this.TotalWeeklyHours[week] > 24) {
        event.target.value = 24 - this.TotalWeeklyHours[week] + this.NewlyEnteredItems[value][week][0].Hours;
        this.NewlyEnteredItems[value][week][0].Hours = Math.round((24 - this.TotalWeeklyHours[week] + this.NewlyEnteredItems[value][week][0].Hours) * 100) / 100;
        this.showAlertMsg("alert-danger", "Total Hours should not exceed 24, Maximum value that can be entered is " + this.NewlyEnteredItems[value][week][0].Hours, "glyphicon-alert");
      }
      this.TotalHoursByWeek(week);
    }
    this.EventValue = 0;
    this.EventKey = '';
  }

  public onProjectChange(value): void {
    this.timesheetdisplay[value].JobId = null;
  }

  public onNewRowProjectChange(value): void {
    this.NewlyEnteredItems[value].JobId = null;
  }

  public onClientChange(value): void {
    this.timesheetdisplay[value].ProjectId = null;
    this.timesheetdisplay[value].JobId = null;
  }

  public onNewRowClientChange(value): void {
    this.NewlyEnteredItems[value].ProjectId = null;
    this.NewlyEnteredItems[value].JobId = null;
  }

  public TimeSheetSave(): void {

    let NewEntrytimesheet: Timesheet[] = [];
    let duplicateValidation: boolean = true;
    let projectJobValidation: boolean = true;
    let hourValidation: boolean = true;
    let Indexes: number[] = [];
    this.newClientErrorHighlight = [];
    this.newProjectErrorHighlight = [];
    this.newJobErrorHighlight = [];
    this.existingProjectErrorHighlight = [];
    this.existingJobErrorHighlight = [];
    this.duplicateErrorHighlight = [];
    this.newduplicateErrorHighlight = [];


    //----------------Project and Job Validation-------------------------

    for (let newIndex: number = 0; newIndex < this.NewlyEnteredItems.length; newIndex++) {
      if (!this.NewlyEnteredItems[newIndex].ClientId) {
        this.newClientErrorHighlight.push(newIndex);
        this.showAlertMsg("alert-danger", "Please fill in required field highlighted in red.", "glyphicon-alert");
        projectJobValidation = false;
        hourValidation = false;
      }

      if (!this.NewlyEnteredItems[newIndex].ProjectId) {
        this.newProjectErrorHighlight.push(newIndex);
        this.showAlertMsg("alert-danger", "Please fill in required field highlighted in red.", "glyphicon-alert");
        projectJobValidation = false;
        hourValidation = false;
      }

      if (!this.NewlyEnteredItems[newIndex].JobId) {
        this.newJobErrorHighlight.push(newIndex);
        this.showAlertMsg("alert-danger", "Please fill in required field highlighted in red", "glyphicon-alert");
        projectJobValidation = false;
        hourValidation = false;
      }
    }

    for (let newIndex: number = 0; newIndex < this.timesheetdisplay.length; newIndex++) {
      if (!this.timesheetdisplay[newIndex].ProjectId) {
        this.existingProjectErrorHighlight.push(newIndex);
        this.showAlertMsg("alert-danger", "Please fill in required field highlighted in red", "glyphicon-alert");
        projectJobValidation = false;
        hourValidation = false;
      }

      if (!this.timesheetdisplay[newIndex].JobId) {
        this.existingJobErrorHighlight.push(newIndex);
        this.showAlertMsg("alert-danger", "Please fill in required field highlighted in red", "glyphicon-alert");
        projectJobValidation = false;
        hourValidation = false;
      }
    }

    //--------------------------Hour Validation---------------------------
    if (hourValidation) {
      this.NewlyEnteredItems.forEach(element => {
        if ((element.Monday[0].Hours == 0 || element.Monday[0].Hours == null) &&
          (element.Tuesday[0].Hours == 0 || element.Tuesday[0].Hours == null) &&
          (element.Wednesday[0].Hours == 0 || element.Wednesday[0].Hours == null) &&
          (element.Thursday[0].Hours == 0 || element.Thursday[0].Hours == null) &&
          (element.Friday[0].Hours == 0 || element.Friday[0].Hours == null) &&
          (element.Saturday[0].Hours == 0 || element.Saturday[0].Hours == null) &&
          (element.Sunday[0].Hours == 0 || element.Sunday[0].Hours == null)) {
          this.showAlertMsg("alert-danger", "Hours need to be entered.", "glyphicon-time");
          projectJobValidation = false;
        }
      });
    }


    //---------------------Duplicate Entry Validation---------------------
    for (var i = 0; i < this.timesheetdisplay.length; i++) {
      for (var j = 0; j < this.NewlyEnteredItems.length; j++) {
        if (this.NewlyEnteredItems[j].ClientId == this.timesheetdisplay[i].ClientId &&
          this.NewlyEnteredItems[j].ProjectId == this.timesheetdisplay[i].ProjectId &&
          this.NewlyEnteredItems[j].JobId == this.timesheetdisplay[i].JobId &&
          this.NewlyEnteredItems[j].Comments.trim().toLowerCase() == this.timesheetdisplay[i].Comments.trim().toLowerCase() &&
          this.NewlyEnteredItems[j].IsBillable == this.timesheetdisplay[i].IsBillable) {
          duplicateValidation = false;
          this.duplicateErrorHighlight.push(i);
          this.newduplicateErrorHighlight.push(j);
        }
      }
    }

    for (var i = 0; i < this.NewlyEnteredItems.length; i++) {
      for (var j = 0; j < this.NewlyEnteredItems.length; j++) {
        if (i != j) {
          if (this.NewlyEnteredItems[j].ClientId != null && this.NewlyEnteredItems[j].ProjectId != null && this.NewlyEnteredItems[j].JobId != null) {
            if (this.NewlyEnteredItems[i].ClientId == this.NewlyEnteredItems[j].ClientId &&
              this.NewlyEnteredItems[i].ProjectId == this.NewlyEnteredItems[j].ProjectId &&
              this.NewlyEnteredItems[i].JobId == this.NewlyEnteredItems[j].JobId &&
              this.NewlyEnteredItems[i].Comments.trim().toLowerCase() == this.NewlyEnteredItems[j].Comments.trim().toLowerCase() &&
              this.NewlyEnteredItems[i].IsBillable == this.NewlyEnteredItems[j].IsBillable) {
              duplicateValidation = false;
              this.newduplicateErrorHighlight.push(i);
            }
          }
        }
      }
    }

    for (var i = 0; i < this.timesheetdisplay.length; i++) {
      for (var j = 0; j < this.timesheetdisplay.length; j++) {
        if (i != j) {
          if (this.timesheetdisplay[i].ClientId == this.timesheetdisplay[j].ClientId &&
            this.timesheetdisplay[i].ProjectId == this.timesheetdisplay[j].ProjectId &&
            this.timesheetdisplay[i].JobId == this.timesheetdisplay[j].JobId &&
            this.timesheetdisplay[i].Comments.trim().toLowerCase() == this.timesheetdisplay[j].Comments.trim().toLowerCase() &&
            this.timesheetdisplay[i].IsBillable == this.timesheetdisplay[j].IsBillable) {
            duplicateValidation = false;
            this.duplicateErrorHighlight.push(i);
          }
        }
      }
    }

    if (!duplicateValidation) {
      this.showAlertMsg("alert-danger", "Duplicate entries found, data cannot be updated. Please check the highlighted rows for similar data.", "glyphicon-duplicate");
    }

    for (let newIndex: number = 0; newIndex < this.NewlyEnteredItems.length; newIndex++) {
      for (let weekIndex: number = 0; weekIndex < this.weekValues.length; weekIndex++) {
        if (this.NewlyEnteredItems[newIndex][this.weekValues[weekIndex]][0].Hours == null) {
          this.NewlyEnteredItems[newIndex][this.weekValues[weekIndex]][0].Hours = 0;
        }
      }
    }

    for (let newIndex: number = 0; newIndex < this.timesheetdisplay.length; newIndex++) {
      for (let weekIndex: number = 0; weekIndex < this.weekValues.length; weekIndex++) {
        if (this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].Hours == null) {
          this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].Hours = 0;
        }
      }
    }

    if (duplicateValidation && projectJobValidation) {
      //------------------ADD NEW ENTRY------------------------------
      for (let newIndex: number = 0; newIndex < this.NewlyEnteredItems.length; newIndex++) {
        for (let weekIndex: number = 0; weekIndex < this.weekValues.length; weekIndex++) {
          this.NewlyEnteredItems[newIndex][this.weekValues[weekIndex]][0].ClientId = this.NewlyEnteredItems[newIndex].ClientId;
          this.NewlyEnteredItems[newIndex][this.weekValues[weekIndex]][0].ProjectId = this.NewlyEnteredItems[newIndex].ProjectId;
          this.NewlyEnteredItems[newIndex][this.weekValues[weekIndex]][0].JobId = this.NewlyEnteredItems[newIndex].JobId;
          this.NewlyEnteredItems[newIndex][this.weekValues[weekIndex]][0].Comments = this.NewlyEnteredItems[newIndex].Comments;
          this.NewlyEnteredItems[newIndex][this.weekValues[weekIndex]][0].IsBillable = this.NewlyEnteredItems[newIndex].IsBillable;
        }

        for (let weekIndex = 0; weekIndex < this.weekValues.length; weekIndex++) {
          if (this.NewlyEnteredItems[newIndex][this.weekValues[weekIndex]][0].Hours > 0) {
            NewEntrytimesheet.push(this.NewlyEnteredItems[newIndex][this.weekValues[weekIndex]][0]);
          }
        }
      }

      //------------------FOR UPDATION-------------------------------
      for (let newIndex: number = 0; newIndex < this.timesheetdisplay.length; newIndex++) {
        let PropertyModified: boolean = false;
        for (let index = 0; index < this.WeekObjectProperties.length; index++) {
          if (this.CompareTimesheet[newIndex][this.WeekObjectProperties[index]] !== this.timesheetdisplay[newIndex][this.WeekObjectProperties[index]]) {
            for (let weekIndex: number = 0; weekIndex < this.weekValues.length; weekIndex++) {
              this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0][this.WeekObjectProperties[index]] = this.timesheetdisplay[newIndex][this.WeekObjectProperties[index]];
            }
            PropertyModified = true;
          }
        }

        for (let weekIndex: number = 0; weekIndex < this.weekValues.length; weekIndex++) {
          if ((PropertyModified && this.CompareTimesheet[newIndex][this.weekValues[weekIndex]][0].Hours > 0) ||
            (this.CompareTimesheet[newIndex][this.weekValues[weekIndex]][0].Hours !== this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].Hours
              && this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].Hours !== 0)) {
            if (!this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].Id) {
              this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].ClientId = this.timesheetdisplay[newIndex].ClientId;
              this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].ProjectId = this.timesheetdisplay[newIndex].ProjectId;
              this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].JobId = this.timesheetdisplay[newIndex].JobId;
              this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].Comments = this.timesheetdisplay[newIndex].Comments;
              this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].CreatedId = this.CreatedId;
              this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].IsBillable = this.timesheetdisplay[newIndex].IsBillable;
              this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].Hours = this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].Hours;
            }
            this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].Date = moment(this.FromDate).add(weekIndex, 'day').format('YYYY-MM-DD').toString();
            NewEntrytimesheet.push(this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0]);
          }
        }
      }

      for (let newIndex: number = 0; newIndex < this.timesheetdisplay.length; newIndex++) {
        for (let weekIndex: number = 0; weekIndex < this.weekValues.length; weekIndex++) {
          if (this.CompareTimesheet[newIndex][this.weekValues[weekIndex]][0].Hours !== this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].Hours
            && this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].Hours === 0
            && this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].Id) {
            Indexes.push(this.timesheetdisplay[newIndex][this.weekValues[weekIndex]][0].Id);
          }
        }
      }

      if (NewEntrytimesheet.length > 0) {
        this.dataUpdate = true;
        this.timesheetService.addTimesheets(NewEntrytimesheet)
          .then(data => {
            if (data) {
              this.dataUpdate = false;
              this.NewlyEnteredItems = [];
              if (Indexes.length > 0) {
                this.timesheetService.deleteTimeSheetEntries(Indexes)
                  .then(data => {
                    if (data) {
                      this.TotalHours();
                      if (this.timesheetdisplay.length) {
                        this.NoData = false;
                      }
                      this.showAlertMsg("alert-success", "Timesheet Data Updated.", "glyphicon-ok");
                      this.getUserWeeklyTimesheetData(this.FromDate, this.CreatedId);
                    }
                    else {
                      this.showAlertMsg("alert-danger", "Something went wrong", "glyphicon-alert");
                      this.dataUpdate = false;
                    }
                  })
                  .catch(error => {
                    this.showAlertMsg("alert-danger", "Something went wrong", "glyphicon-alert");
                    this.dataUpdate = false;
                  });
              }
              else {
                this.showAlertMsg("alert-success", "Timesheet Data Updated.", "glyphicon-ok");
                this.getUserWeeklyTimesheetData(this.FromDate, this.CreatedId);
              }
            }
            else {
              this.showAlertMsg("alert-danger", "Something went wrong", "glyphicon-alert");
              this.dataUpdate = false;
            }
          })
          .catch(error => {
            this.showAlertMsg("alert-danger", "Something went wrong", "glyphicon-alert");
            this.dataUpdate = false;
          });

        //----------DELETE IF ALL ENTRIES ARE ZERO---------------------      
      }
      else if (Indexes.length > 0) {
        this.timesheetService.deleteTimeSheetEntries(Indexes)
          .then(data => {
            if (data) {
              this.showAlertMsg("alert-success", "Timesheet Data Updated.", "glyphicon-ok");
              this.TotalHours();
              if (this.timesheetdisplay.length) {
                this.NoData = false;
              }
              this.getUserWeeklyTimesheetData(this.FromDate, this.CreatedId);
            }
          })
          .catch(error => {
            this.showAlertMsg("alert-danger", "Something went wrong", "glyphicon-alert");
            this.dataUpdate = false;
          });
      }
    }
  }

  public DecimalValidate(event: any): boolean {
    this.EventValue = event.target.value;
    this.EventKey = event.key;
    if (event.charCode == 43 || event.charCode == 45 || (event.target.value.indexOf(".") >= 0 && event.key == ".")) {
      return false;
    }
    let value: string = event.target.value || "0";
    var v = /^\d+(?:\.\d{1})?$/
    if (v.test(value)) {
      return true;
    }
    else {
      return false;
    }
  }

  public AddNewRow(): void {
    this.NoData = false;
    this.NewlyEnteredItems.push(
      {
        ClientId: null,
        ProjectId: null,
        JobId: null,
        Comments: "",
        IsBillable: false,
        Monday: [new Timesheet(null, this.FromDate, 0, null, false, this.CreatedId, null, null, null, null)],
        Tuesday: [new Timesheet(null, moment(this.FromDate).add(1, 'day').format('YYYY-MM-DD').toString(), 0, null, false, this.CreatedId, null, null, null, null)],
        Wednesday: [new Timesheet(null, moment(this.FromDate).add(2, 'day').format('YYYY-MM-DD').toString(), 0, null, false, this.CreatedId, null, null, null, null)],
        Thursday: [new Timesheet(null, moment(this.FromDate).add(3, 'day').format('YYYY-MM-DD').toString(), 0, null, false, this.CreatedId, null, null, null, null)],
        Friday: [new Timesheet(null, moment(this.FromDate).add(4, 'day').format('YYYY-MM-DD').toString(), 0, null, false, this.CreatedId, null, null, null, null)],
        Saturday: [new Timesheet(null, moment(this.FromDate).add(5, 'day').format('YYYY-MM-DD').toString(), 0, null, false, this.CreatedId, null, null, null, null)],
        Sunday: [new Timesheet(null, moment(this.FromDate).add(6, 'day').format('YYYY-MM-DD').toString(), 0, null, false, this.CreatedId, null, null, null, null)]
      } as WeeklyTimeSheetDisplay);
  }

  public DeleteNewRow(index): void {
    if (confirm("Are you sure to delete this row ?")) {
      if (this.NewlyEnteredItems.length) {
        this.NewlyEnteredItems.splice(index, 1);
        this.TotalHours();
        if (this.timesheetdisplay.length || this.NewlyEnteredItems.length) {
          this.NoData = false;
        }
        else {
          this.NoData = true;
        }
      }
    }
  }

  public DeleteRow(index): void {
    this.loader = index;
    if (confirm("Are you sure to delete this row ?")) {
      this.deleteTimesheets = true;
      let Indexes: number[] = [];

      for (let weekIndex: number = 0; weekIndex < this.weekValues.length; weekIndex++) {
        if (this.timesheetdisplay[index][this.weekValues[weekIndex]][0].Id) {
          Indexes.push(this.timesheetdisplay[index][this.weekValues[weekIndex]][0].Id);
        }
      }
      this.timesheetService.deleteTimeSheetEntries(Indexes)
        .then(data => {
          if (data) {
            this.deleteTimesheets = false;
            this.timesheetdisplay.splice(index, 1);
            this.showAlertMsg("alert-success", "Timesheet Data Deleted", "glyphicon-ok");
            this.TotalHours();
            if (this.timesheetdisplay.length) {
              this.NoData = false;
            }
            else {
              this.NoData = true;
            }
          }
        })
        .catch(error => {
          this.showAlertMsg("alert-danger", "Something went wrong", "glyphicon-alert");
        });
    }
  }

  public showAlertMsg(type: string, msg: string, icon: string): void {
    this.alertClass = type;
    this.successMessage = msg;
    this.icon = icon;
    setTimeout(() => {
      this.successMessage = "";
    }, 2500);
  }

}

