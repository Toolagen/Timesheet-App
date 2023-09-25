import { Component, OnInit, NgZone, transition, } from '@angular/core';
import { Http, Headers, RequestOptions, Response, } from '@angular/http';
import * as moment from 'moment/moment';
import { environment } from 'environments/environment';
import * as _ from 'underscore';


import { DatePipe } from '@angular/common';
//import modules 
import { WeeklyTimesheetEntry } from 'app/models/weeklyTimesheetEntry';
import { TimesheetGrid } from 'app/models/timesheet-grid';
import { Timesheet } from 'app/models/timesheet';
import { Job } from 'app/models/job';
import { Project } from 'app/models/project';
import { User } from 'app/models/user';
import { Client } from 'app/models/client';

//import the services
import { TimesheetService } from 'app/services/timesheet.service';
import { ClientService } from 'app/services/client.service';
import { UserService } from 'app/services/user.service';
import { PagerService } from 'app/services/pager.service';
import { JobService } from 'app/services/job.service';
import { ProjectService } from 'app/services/project.service';
import { error } from 'util';
import { AddClientProject } from 'app/models/addClientProject';
import { Angular2Csv } from 'angular2-csv';

@Component({
  selector: 'app-timesheet-entry-report',
  templateUrl: './timesheet-entry-report.component.html',
  styleUrls: ['./timesheet-entry-report.component.css'],
  providers : [TimesheetService, UserService, PagerService, JobService, ProjectService,DatePipe]
})
export class TimesheetEntryReportComponent implements OnInit {
  /* Declare global variables*/
  public selectedPageSize:number = 50;
 public selectedProjectStatus:number=1;
  public FromDate: string;
  public ToDate: string;
  public today : string;
  public timesheets: TimesheetGrid[];
  public cachedTimesheets: TimesheetGrid[];
  public timesheetsDataByDate:TimesheetGrid[];
  public timesheetFilter:TimesheetGrid[];
  public ShowTimesheetData: boolean;
  public errorMessage: string;
  public clients : Client[];
  public jobs: Job[];
  public allJobs:Job[];
  public projects: Project[];
  public allUsers :User[];
  public users:User[];
  public validationErrorHour: string;
  public validationErrorDate: string;
  public validationErrorProject: string;
  public validationErrorJob: string;
  public validationErrorClient : string;    //NEW
  public successMessage: string;
  public timesheetVisible: boolean;
  public filterClientId:number;
  public filterProjectId:number;
  public filterUserId:number;
  public loggedInUserEmail: string = JSON.parse(localStorage.getItem('currentUser')).username;
  public selectedClient:Client;
  public selectedProject:Project;
  public selectedUser:User;
  public filterBillable :number;
  public totalHours:number;
  weeklyTimesheetEntry = new WeeklyTimesheetEntry(null, null, null);
  timesheet = new Timesheet(null, null, null, null, false, null, null, null, null, null);
  public clientformload: boolean;      // Loads client form
  public projectformload: boolean;     // Loads project form
  public addproject: boolean;          // To display +(plus) button
  public activeClient: boolean;        // To display active clients  
  public activeJob: boolean;           // To display active Jobs
  public activeProject: boolean;       // To display active Projects
  public loadProject: boolean;
  public isProject: boolean;
  public previouslink: string;         // stores the name of previous true value, used in cancel function of Client and Project
  public viewProjects: Project[];
  public CompareProjects: Project[];
  public noProject: boolean;           // true when data length is 0

  // Paging
  // pager object
  pager: any = {};
  pagedItems: any[];
  ExistJObId: number;

  public loadingJobs : boolean;
  public loadingTimesheets : boolean;
  public loadingClients : boolean;
  public loadingProjects : boolean;
  public loadingUsers:boolean;
  loading : boolean;
  public loadClient: boolean;
  public allClients: Client[];
  public viewClients: Client[];
  public CompareClients: Client[];
  public noClients: boolean;  
  public allProjects: Project[];
  public AddJob = new AddClientProject(null, null, null, null, null, null, null, null, "", false, true, null);
  public validationNewProject: string;
  constructor(
    private http: Http,
    private userService: UserService,
    private timesheetService: TimesheetService,
    private clientService : ClientService,
    private pagerService: PagerService,
    private jobService: JobService,
    private projectService: ProjectService,
    private DatePipe:DatePipe
  ) { }

  ngOnInit() {
    var startOfWeek = moment().startOf('week').toDate();
    var endOfWeek   = moment().endOf('week').toDate();
    this.today = this.formatDate(new Date(Date.now()));
    this.FromDate = this.formatDate(new Date(this.today));
    this.weeklyTimesheetEntry.FromDate = this.FromDate;
    this.ToDate = this.formatDate(new Date(this.today));
    this.weeklyTimesheetEntry.ToDate = this.ToDate;
    this.getUserByEmail(this.loggedInUserEmail);
    
    //this.getProjects();
    this.getAllUsers();
    this.timesheetVisible = false;
    this.loadingTimesheets = true;
    this.onProjectStatusChange();
    this.getClients();
  }
  onProjectStatusChange()
  {
    // console.log(this.selectedProjectStatus)
    this.filterClientId =0;
    this.filterProjectId=0;
    this.getClients();
  }


  getClients() {
    this.loadingClients = true;
    
    if (this.selectedProjectStatus == 1 || this.selectedProjectStatus == 3) {
      this.clientService.getAllClients()
        .subscribe(
          data => {
            this.allClients = data;
            this.clients = this.allClients.filter(c => c.StatusId == 1);
            this.loadingClients = false;
          },
          error => {
            this.loadingClients = false;
            this.errorMessage = "";
          }
        );
    } else
    {
      this.clientService.getAllClients()
      .subscribe(
        data => {
          this.allClients=data;
          this.clients =this.allClients.filter(c => c.StatusId ==2)
          this.loadingClients = false;
        },
        error => {
          this.loadingClients = false;
          this.errorMessage = "";
        }
      );
    }
    
  }
  

  // onProjectStatusChange()
  // {
  //   console.log(this.selectedProjectStatus)
  // }

  onClientChange(newClientId) {
   if(this.selectedProjectStatus==1)
   {
    this.timesheet.ProjectId = null;
    this.timesheet.ClientId = newClientId;
    this.jobs=[];
    this.loadingProjects = true;
    this.projectService.getProjectsByClient(newClientId)
      .subscribe( 
      data => {
        this.allProjects=data;
        this.projects = this.allProjects.filter(c=>c.StatusId==1)
        this.loadingProjects = false;    
      },
      error => { this.loadingProjects = false; this.errorMessage = "Projects data not found";  });
   }
 else
 {
  this.timesheet.ProjectId = null;
  this.timesheet.ClientId = newClientId;
  this.jobs=[];
  this.loadingProjects = true;
  this.projectService.getProjectsByClient(newClientId)
    .subscribe( 
    data => {
      this.allProjects=data;
   
      this.loadingProjects = false;    
    },
    error => { this.loadingProjects = false; this.errorMessage = "Projects data not found";  });
 }
 
  }


  // getProjects() {
  //   this.loadingProjects = true;
  //   this.projectService.getAllProjects()
  //     .subscribe(
  //     data => {
  //       this.projects = data;
  //       this.loadingProjects = false;
  //     },
  //     error => {this.loadingProjects = false; this.errorMessage = "" } );
  // }

 getAllUsers()
 {
   this.loadingUsers=true;
   this.userService.getAllUsers()
   .subscribe(
     data=>
     {
      
       this.users=data;
       this.loadingUsers=false;
     },
     error=>{this.loadingUsers=false;this.errorMessage=""});
 }

  getUserByEmail(email) {
    this.userService.getUserByEmail(email)
      .subscribe(
      data => {
        this.weeklyTimesheetEntry.CreatedId = data[0].Id;
        this.getAllTimesheetDataByDateRange(this.weeklyTimesheetEntry.FromDate, this.weeklyTimesheetEntry.ToDate);
      },
      error => this.errorMessage = ""
      );
  }
  onProjectChange(newProjectId) {
    this.loadingJobs = true;
    this.timesheet.JobId = null;
    this.timesheet.ProjectId = newProjectId;
    this.jobService.getJobsByProject(newProjectId)
      .subscribe(
      data => {
       
        this.jobs = data;
        this.loadingJobs = false;
      },
      error => {this.loadingJobs = false; this.errorMessage = "Jobs data not found" });
  }

  onJobChange(newJobId) {
    this.timesheet.JobId = newJobId;
  }

  //Filter By Clients
  onClientChangeFilter(newClientIdFilter) { 
    if(this.selectedProjectStatus==1)
    {
      this.projects=[];  
    this.filterProjectId = null;
    this.filterUserId=null;
    this.filterBillable=null;
    if(newClientIdFilter!=0 || newClientIdFilter == "") {
      this.filterProjectId = null;
      this.timesheet.ProjectId = null;
    this.timesheet.ClientId = newClientIdFilter;
    this.loadingProjects = true;
    this.projectService.getProjectsByClient(newClientIdFilter)
      .subscribe( 
      data => {
        this.allProjects=data;
        this.projects = this.allProjects.filter(c=>c.StatusId == 1)
        this.loadingProjects = false;    
      },
      error => { this.loadingProjects = false; });

      this.filterClientId = newClientIdFilter;
      this.selectedClient=this.clients.filter(c=>c.Id==this.filterClientId)[0];
      this.filterTimesheetData();
    }     
    }
    else if(this.selectedProjectStatus==2 || this.selectedProjectStatus==3){
      this.projects=[];  
    this.filterProjectId = null;
    this.filterUserId=null;
    this.filterBillable=null;
    if(newClientIdFilter!=0 || newClientIdFilter == "") {
      this.filterProjectId = null;
      this.timesheet.ProjectId = null;
    this.timesheet.ClientId = newClientIdFilter;
    this.loadingProjects = true;
    this.projectService.getProjectsByClient(newClientIdFilter)
      .subscribe( 
      data => {
        this.allProjects=data;
        this.projects = this.allProjects.filter(c=>c.StatusId == 2)
        this.loadingProjects = false;    
      },
      error => { this.loadingProjects = false; });

      this.filterClientId = newClientIdFilter;
      this.selectedClient=this.clients.filter(c=>c.Id==this.filterClientId)[0];
      this.filterTimesheetData();
    }   
    }
  }

  //Filter By Projects
  onProjectChangeFilter(newProjectIdFilter) {
     
      this.filterProjectId = newProjectIdFilter;
      this.selectedProject = this.projects.filter(c=>c.Id==this.filterProjectId)[0] ;
      this.filterTimesheetData();
     
   
  }

  //Filter By Users
  onUserChangeFilter(newUserIdFilter)
  {
    this.filterUserId=newUserIdFilter;
    this.selectedUser=this.users.filter(c=>c.id==this.filterUserId )[0];
    this.filterTimesheetData();
  }

  //For Billable Filter
  onBillableChange(newBillable)
  {
    this.filterBillable=newBillable;
    this.filterTimesheetData();
  }
   //Get Timesheet Data by Date Range 
   getAllTimesheetDataByDateRange(fromdate, todate) {
    this.loadingTimesheets = true;
    if (fromdate <= todate) {
      this.timesheetService.getAllTimesheetDataByDateRange(fromdate, todate)
        .subscribe(
        data => {
          this.timesheets = data;
          this.cachedTimesheets = data;
          this.filterTimesheetData();
          this.loadingTimesheets = false;
        },
        error => this.errorMessage = "");
    }
    else {
      this.errorMessage = "From Date must be less than or equal To Date";
      this.timesheetService.getAllTimesheetDataByDateRange(fromdate, todate)
        .subscribe(
        data => {
          this.timesheets = data;
          this.cachedTimesheets = data;
          this.filterTimesheetData();
          this.loadingTimesheets = false;
        },
        error => {
          this.errorMessage = "";
          this.loadingTimesheets = true;
        });
    }
    setTimeout(() => {
      this.errorMessage = "";
    }, 2500);

  }

  CancelEdit() {
    this.clearTimesheetForm();
    this.clearValidationErrors();
    this.timesheetVisible = false;
  }
  clearTimesheetForm() {
    this.timesheet = new Timesheet(null, this.timesheet.Date, null, '', false, this.timesheet.CreatedId, null, null, null, null);
    this.onProjectChange(0);
  }

  clearValidationErrors() {
    if (this.timesheet.Date > this.today) {
      this.timesheet.Date = this.today;

    }
    this.validationErrorHour = "";
    this.validationErrorDate = "";
    //this.validationErrorUser = "";
    this.validationErrorProject = "";
    this.validationErrorJob = "";

  }

  RemoveCommentWhiteSpaces() {
    this.timesheet.Comments = this.timesheet.Comments.replace(/\s+/g, ' ');

  }
  onTimesheetSubmit() {
    // save timesheet data into database
  
    if (this.validateForm()) {
      this.loading = true;
      this.timesheet.CreatedId = this.weeklyTimesheetEntry.CreatedId;
      this.timesheetService.addTimesheet(this.timesheet)
        .then(
        data => {
          if (data) {
            this.getAllTimesheetDataByDateRange(this.weeklyTimesheetEntry.FromDate, this.weeklyTimesheetEntry.ToDate);
            if (this.timesheet.Id) {
              this.loading = false;
              this.successMessage = "Timesheet data updated";
            }
            else {
              this.loading = false;
              this.successMessage = "Timesheet data added";
            }
            this.timesheetVisible = false;
            this.clearTimesheetForm();
            setTimeout(() => {
              this.successMessage = "";
              //location.reload();
            }, 3000);
          } else {
            this.errorMessage = "Error while adding Timesheet data";
            setTimeout(() => {
              this.errorMessage = "";
            }, 3000);
            this.loading = false;
          }
        },
        error => {
          this.errorMessage = "Error while adding Timesheet data";
          setTimeout(() => {
            this.errorMessage = "";
          }, 3000);
          this.loading = false;
        });
    }
    //this.timesheetVisible=false;
  }
  validateForm() {
    let dateValidated = false;
    let hourValidated = false;
    let clientValidated = false;
    let projectValidated = false;
    let jobValidated = false;

    // if (!this.timesheet.CreatedId) {
    //   this.validationErrorUser = "User is required";
    //   userValidated = false;
    // } else {
    //   userValidated = true;
    //   this.validationErrorUser = "";
    // }

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
    else if (!/^(\d{0,2}(\.\d{0,1})?)$/.test(this.timesheet.Hours.toString())) {
      this.validationErrorHour = "Hour should only contain one decimal digit";
      hourValidated = false;
    } else if (this.UserWorkHours() > 24) {
      this.validationErrorHour = "Maximum 24 hours allowed for a user to enter";
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

    return projectValidated && jobValidated && dateValidated && hourValidated;
  }


  DeleteTimesheet(id) {
    if (confirm("Are you sure to delete this item?")) {
      this.timesheetService.deleteTimeSheetEntry(id)
        .then(
        data => {
          if (data) {
            this.getAllTimesheetDataByDateRange(this.weeklyTimesheetEntry.FromDate, this.weeklyTimesheetEntry.ToDate);
            this.clearTimesheetForm();
            this.successMessage = "Timesheet entry deleted";
            this.timesheetVisible=false;
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

  EditTimesheet(timesheet) {
    if (confirm("Do you want to edit?")) {
      this.clearValidationErrors();
      this.onClientChange(timesheet.ClientId);
      this.onProjectChange(timesheet.ProjectId);
      this.timesheet = new Timesheet(timesheet.Id, this.formatDate(new Date(timesheet.WorkDate)), timesheet.WorkHour, timesheet.Comments, timesheet.IsBillable,
        timesheet.UserId, timesheet.UserId, timesheet.ProjectId, timesheet.JobId, timesheet.ClientId);
      this.timesheetVisible = true;
      this.getUserTimesheetDataByDate(this.timesheet.Date);
    }
  }
   //Get Timesheet Data by timesheet Date   
  getUserTimesheetDataByDate(workdate){
    //this.clearTimesheetForm();
    this.timesheetService.getTimeSheetGridDataByDate(workdate)
      .subscribe(
      data => {
          this.timesheetsDataByDate = data;
      },
      error => this.errorMessage = "");
  }
  //Calculate and return timesheet hours
  UserWorkHours(): number {
    try {
      var totalHours: number = this.timesheet.Hours;
      var userTimesheets = this.timesheetsDataByDate.filter(c => this.formatDate(new Date(c.WorkDate)) == this.timesheet.Date && c.Id != this.timesheet.Id && c.UserId == this.timesheet.CreatedId);
      userTimesheets.forEach(element => {
        totalHours = totalHours + element.WorkHour;
      });
      return totalHours;
    }
    catch (Exception) {
      return null;
    }
  }

  //Filter method
  filterTimesheetData() {
    this.loadingTimesheets = true;
    this.timesheets = this.cachedTimesheets;
  
    if (this.filterClientId && this.filterProjectId && this.filterUserId) {
      this.timesheetFilter = this.timesheets.filter(c => c.ClientId == this.filterClientId && c.ProjectId == this.filterProjectId && c.UserId == this.filterUserId );
      this.timesheets = this.timesheetFilter;
    } else if (this.filterClientId && this.filterUserId) {
      this.timesheetFilter = this.timesheets.filter(c => c.ClientId == this.filterClientId && c.UserId == this.filterUserId  );
      this.timesheets = this.timesheetFilter;
    } else if (this.filterProjectId && this.filterClientId) {
      this.timesheetFilter = this.timesheets.filter(c => c.ProjectId == this.filterProjectId && c.ClientId == this.filterClientId  );
      this.timesheets = this.timesheetFilter;
    } else if (this.filterClientId) {
      this.timesheetFilter = this.timesheets.filter(c => c.ClientId == this.filterClientId );
      this.timesheets = this.timesheetFilter;
    } else if (this.filterProjectId) {
      this.timesheetFilter = this.timesheets.filter(c => c.ProjectId == this.filterProjectId );
      this.timesheets = this.timesheetFilter;
    } else if (this.filterUserId) {
      this.timesheetFilter = this.timesheets.filter(c => c.UserId == this.filterUserId );
      this.timesheets = this.timesheetFilter;
    }
    //By Billable
    if (this.filterBillable == 1) {
      this.timesheets = this.timesheets;
    } else if (this.filterBillable == 2) {
      this.timesheetFilter = this.timesheets.filter(c => c.IsBillable == true );
      this.timesheets = this.timesheetFilter;
    } else if (this.filterBillable == 3) {
      this.timesheetFilter = this.timesheets.filter(c => c.IsBillable == false);
      this.timesheets = this.timesheetFilter;
    }

this.calculateTotalHours();
this.ShowTimesheetData = this.timesheets.length > 0;
this.pager = {};
this.setPage(1);
this.loadingTimesheets = false;
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
  
  
  /*
  
  
  //Pagination Setup
  setPage(page: number) {
    if (page < 1 || page > this.pager.totalPages) {
      return;
    }

    // get pager object from service
    this.pager = this.pagerService.getPager(this.timesheets.length, page);

    // get current page of items
    this.pagedItems = this.timesheets.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }
 
*/



// Pagination Setup
setPage(page: number) {
  if (page < 1 || page > this.pager.totalPages) {
    return;
  }

  // Get pager object from service
  this.pager = this.pagerService.getPager(this.timesheets.length, page, this.selectedPageSize);

  // Get current page of items
  this.pagedItems = this.timesheets.slice(this.pager.startIndex, this.pager.endIndex + 1);
}

// Update page size when selectedPageSize changes
onPageSizeChange() {
  this.setPage(1); // Reset to the first page
}





  calculateTotalHours(): number {
    try {
      this.totalHours=0;
      var totalHoursTimesheet=this.timesheets.filter(c=>c.Project.trim()!='Holiday')
      totalHoursTimesheet.forEach(element =>  {
        this.totalHours = this.totalHours + element.WorkHour;
        return this.totalHours;
      });
    }
    catch (Exception) {
      return null;
    }
  }
  ExportTimesheetData()
  {
    let data = [];
    var datePipe=new DatePipe("en-US");
    this.timesheets.forEach(function(timesheet) {
      //Format timesheet
     var formateWorkDate=datePipe.transform(timesheet.WorkDate.toString(),'dd-MM-yyyy');
     var gridata = new GridData( timesheet.Users,timesheet.Client,timesheet.Project, timesheet.Job, formateWorkDate , timesheet.WorkHour, 
                                timesheet.Comments!=null? timesheet.Comments : '',timesheet.IsBillable ? 'Yes':'No');
      data.push(gridata);
    });
    var lastRow = new GridData( '','','', '', 'TOTAL HOURS=', this.totalHours, 
       '','');
       data.push(lastRow);
    var head = ['User Name','Client','Project','Job', 'Work Date','Work Hour','Comments','Billable']
    new Angular2Csv(data, (this.selectedUser ? (this.selectedUser.UserName + ' ') : '') +'Timesheet Report '.concat(datePipe.transform(this.weeklyTimesheetEntry.FromDate,'dd-MM-yyyy'),
                          (this.weeklyTimesheetEntry.FromDate !=this.weeklyTimesheetEntry.ToDate ? (' To ' + datePipe.transform(this.weeklyTimesheetEntry.ToDate,'dd-MM-yyyy')) :''),
                                                    (this.selectedClient ?(' ' + this.selectedClient.Name): '')
                                                    ),{headers: (head)});
  }

}

class GridData {
  constructor(
    public Users: string,
    public Client:string,
    public Project: string,
    public Job: string,
    public WorkDate: string,
    public WorkHour: number,
    public Comments: string,
    public IsBillable: string,
  ) { }
}
