import { Component, OnInit } from '@angular/core';
import * as _ from 'underscore';

// Import required models
import { Client } from 'app/models/client';
import { Project } from 'app/models/project';
import { User } from 'app/models/user';
import { Timesheet } from 'app/models/timesheet';
import { Job } from 'app/models/job';
import { TimeAllocation } from 'app/models/timeAllocation';
import { TimeAllocationDetails } from 'app/models/timeAllocationdetails';

// Import required 
import { TimeAllocationService } from 'app/services/time-allocation.service';
import { ClientService } from 'app/services/client.service';
import { ProjectService } from 'app/services/project.service';
import { JobService } from 'app/services/job.service';
import { UserService } from 'app/services/user.service';
import { PagerService } from 'app/services/pager.service';

@Component({
  selector: 'app-time-allocation-details',
  templateUrl: './time-allocation-details.component.html',
  styleUrls: ['./time-allocation-details.component.css'],
  providers: [TimeAllocationService, ClientService, ProjectService, UserService, PagerService],
})
export class TimeAllocationDetailsComponent implements OnInit {

  public timeAllocationdetails: TimeAllocationDetails[];    
  public timeAllocationHistory: TimeAllocationDetails[];
  public allClients: Client[];
  public clients: Client[];
  public allProjects: Project[];
  public projects: Project[];
  public users: User[];
  public today: string;
  public loading: boolean;
  public historyload: boolean;
  public nodata: boolean;  
  public loadingClients: boolean;
  public loadingProjects: boolean;
  public loadingAllocation: boolean;
  public validationErrorClient: string;
  public validationErrorProject: string;
  public validationErrorHour: string;
  public validationErrorDate: string;
  public successMessage: string;
  public errorMessage: string;
  public loggedInUserEmail: string = JSON.parse(localStorage.getItem('currentUser')).username;
  public timeAllocation = new TimeAllocation(null, null, null, null, null, null);
  public timesheet: Timesheet[];

  constructor(
    private timeAllocationService: TimeAllocationService,
    private clientService: ClientService,
    private projectService: ProjectService,
    private jobService: JobService,
    private userService: UserService,
    private pagerService: PagerService,
  ) { }

  ngOnInit() {
    this.today = this.formatDate(new Date(Date.now()));
    this.timeAllocation.Date = this.today;
    this.getAllocationDetails();
    this.getClients();
    this.getUserByEmail(this.loggedInUserEmail);
  }

  getAllocationDetails() {
    this.loadingAllocation = true;
    this.nodata = false;
    this.timeAllocationService.getAllocationDetails()
      .subscribe(
        data => {
          this.timeAllocationdetails = data;
          if(this.timeAllocationdetails.length == 0) {
            this.nodata = true;
            this.loadingAllocation = false;
          }
          for (var i = 0; i < this.timeAllocationdetails.length; i++) {
            this.getTimesheet(this.timeAllocationdetails[i]);
          }          
        },
        error => {
          this.errorMessage = "";
        });
  }

  public getTimesheet(timesheetAllocation: TimeAllocationDetails) {
    this.timeAllocationService.getTimesheet(timesheetAllocation.ClientId, timesheetAllocation.ProjectId)
      .subscribe(
        data => {
          this.timesheet = data;
          if (this.timesheet.length == 0) {
            timesheetAllocation.HoursRemaining = timesheetAllocation.HoursAllocated;
            timesheetAllocation.HoursUtilised = 0;
            this.loadingAllocation = false;
          }
          else {
            timesheetAllocation.HoursUtilised = 0;
            for (var i = 0; i < this.timesheet.length; i++) {
              timesheetAllocation.HoursRemaining = timesheetAllocation.HoursAllocated - (timesheetAllocation.HoursUtilised + this.timesheet[i].Hours);
              timesheetAllocation.HoursUtilised = timesheetAllocation.HoursUtilised + this.timesheet[i].Hours;
            }
            this.loadingAllocation = false;
          }
        })      
  }

  getClients() {
    this.loadingClients = true;
    this.clientService.getAllClients()
      .subscribe(
        data => {
          this.allClients = data;
          this.clients = this.allClients.filter(c => c.StatusId == 1);          
          this.loadingClients = false;
        },
        error => {
          this.loadingClients = false;
          this.errorMessage = ""
        });
  }

  onClientChange(newClientId) {
    this.timeAllocation.ProjectId = null;
    this.timeAllocation.HoursAllocated = null;
    this.timeAllocation.ClientId = newClientId;    
    this.timeAllocation.Id = null;
    this.loadingProjects = true;
    this.projectService.getProjectsByClient(newClientId)
      .subscribe(
        data => {
          this.allProjects = data;
          this.projects = this.allProjects.filter(c => c.StatusId == 1);          
          this.loadingProjects = false;
        },
        error => {
          this.loadingProjects = false;
          this.errorMessage = "Projects data not found";
        });
  }

  public onProjectChange() 
  {
    this.timeAllocation.Id = null;
  }

  getUserByEmail(email) {
    this.userService.getUserByEmail(email)
      .subscribe(
        data => {
          this.timeAllocation.CreatedId = data[0].Id;
        },
        error => this.errorMessage = ""
      );
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

  onDataSubmit() {
    let operation: string = "";           
    if (!this.timeAllocation.Id) {
      operation = "add";
      for (var i = 0; i < this.timeAllocationdetails.length; i++) {
        if (this.timeAllocation.ClientId == this.timeAllocationdetails[i].ClientId &&
          this.timeAllocation.ProjectId == this.timeAllocationdetails[i].ProjectId &&
          this.timeAllocation.HoursAllocated > 0) {
          if (confirm("Similar entry already available. Do you want to add hours to the existing entry ?")) {
            this.timeAllocation.Id = this.timeAllocationdetails[i].Id;
          }
          else {
            return;
          }
        }
      }
    }
    else {
      operation = "update";
    }

    if (this.validateForm()) {
      this.timeAllocationService.addAllocationDetails(this.timeAllocation, operation)
        .then(
          data => {
            if (data) {
              this.getAllocationDetails();
              this.showAlertMsg("Data Updated");
            }
            this.clearForm();
          });
    }
  }

  EditAllocationDetail(TimeAllocated) {    
    if (confirm("Do you want to edit?")) {
      this.clearValidationErrors();
      this.onClientChange(TimeAllocated.ClientId);
      this.timeAllocation = new TimeAllocation(TimeAllocated.Id, TimeAllocated.ClientId, TimeAllocated.ProjectId, TimeAllocated.HoursAllocated, this.formatDate(new Date(TimeAllocated.Date)), this.timeAllocation.CreatedId);    
    }
  }

  CancelEdit() {
    this.clearForm();
    this.clearValidationErrors();
  }

  clearValidationErrors() {
    if (this.timeAllocation.Date > this.today) {
      this.timeAllocation.Date = this.today;
      this.getAllocationDetails();
    }
    this.validationErrorHour = "";
    this.validationErrorDate = "";
    this.validationErrorClient = "";
    this.validationErrorProject = "";
  }

  validateForm() {
    let dateValidated = false;
    let hourValidated = false;
    let clientValidated = false;
    let projectValidated = false;

    if (!this.timeAllocation.ClientId) {
      this.validationErrorClient = "Client is required";
      clientValidated = false;
    } else {
      clientValidated = true;
      this.validationErrorClient = "";
    }

    if (!this.timeAllocation.ProjectId) {
      this.validationErrorProject = "Project is required";
      projectValidated = false;
    } else {
      projectValidated = true;
      this.validationErrorProject = "";
    }
    if (!this.timeAllocation.HoursAllocated) {
      this.validationErrorHour = "Hour is required";
      hourValidated = false;
    }
    else if (!/^(\d{0,5}(\.\d{1})?)$/.test(this.timeAllocation.HoursAllocated.toString())) {
      this.validationErrorHour = "Hour should contain only one decimal digit";
      hourValidated = false;
    }
    else {
      hourValidated = true;
      this.validationErrorHour = "";
    }
    if (!this.timeAllocation.Date) {
      this.validationErrorDate = "Date is required";
      dateValidated = false;
    }
    else if (this.timeAllocation.Date > this.today) {
      this.validationErrorDate = "Date should not be greater than today";
      dateValidated = false;
    }
    else {
      this.validationErrorDate = "";
      dateValidated = true;
    }
    return projectValidated && clientValidated && dateValidated && hourValidated;
  }

  clearForm() {
    this.timeAllocation = new TimeAllocation(null, null, null, null, this.today, this.timeAllocation.CreatedId);    
    this.onClientChange(0);
  }

  DeleteAllocationDetail(id) {
    if (confirm("Are you sure to delete this item?")) {
      this.timeAllocationService.deleteAllocationDetails(id)
        .then(
          data => {
            if (data) {
              this.getAllocationDetails();
              this.clearForm();
              this.successMessage = "Data deleted";
            } else {
              this.errorMessage = "Error while deleting Data";
            }
            setTimeout(() => {
              this.successMessage = "";
              this.errorMessage = "";
            }, 3000);
          },
          error => {
            this.errorMessage = "Error while deleting Data";
            setTimeout(() => {
              this.successMessage = "";
              this.errorMessage = "";
            }, 3000);
          });
    }
  }

  public showAlertMsg(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = "";
    }, 2500);
  }
}



