import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// Import required models
import { Client } from 'app/models/client';
import { Project } from 'app/models/project';
import { User } from 'app/models/user';
import { Job } from 'app/models/job';
import { AddClientProject } from 'app/models/addClientProject';

// Import required 
import { ClientService } from 'app/services/client.service';
import { ProjectService } from 'app/services/project.service';
import { JobService } from 'app/services/job.service';
import { UserService } from 'app/services/user.service';

@Component({
  selector: 'app-addnew-client-project',
  templateUrl: './addnew-client-project.component.html',
  styleUrls: ['./addnew-client-project.component.css'],
  providers: [ClientService, ProjectService, UserService],
})

export class AddnewClientProjectComponent implements OnInit {
  public allClients: Client[];
  public clients: Client[];
  public viewClients: Client[];
  public CompareClients: Client[];
  public allProjects: Project[];
  public viewProjects: Project[];
  public projects: Project[];
  public CompareProjects: Project[];
  public alljobs: Job[];
  public jobs: Job[];
  public CompareJobs: Job[];
  public users: User[];
  public loadingClients: boolean;
  public loadingProjects: boolean;
  public validationErrorClient: string;
  public validationErrorProject: string;
  public validationErrorJob: string;
  public successMessage: string;
  public errorMessage: string;
  public alertClass: string;
  public loggedInUserEmail: string = JSON.parse(localStorage.getItem('currentUser')).username;

  public activeClient: boolean;        // To display active clients  
  public activeProject: boolean;       // To display active Projects
  public activeJob: boolean;           // To display active Jobs
  public clientformload: boolean;      // Loads client form
  public projectformload: boolean;     // Loads project form
  public addproject: boolean;          // To display +(plus) button
  public noClients: boolean;           // true when data length is 0
  public noProject: boolean;           // true when data length is 0
  public noJobs: boolean;              // true when data length is 0
  public previouslink: string;         // stores the name of previous true value, used in cancel function of Client and Project


  //----------------- Loads roll image until Get data function is executed ----------------------------
  public loadClient: boolean;
  public updateClient: boolean;
  public loadProject: boolean;
  public updateProject: boolean;
  public loadJob: boolean;
  public updateJob: boolean;
  public deleteJob: boolean;
  public loader: number;

  //-------------------------- IsActive property in Active Clients, Projects and Jobs section------------------------------------
  public isClient: boolean;
  public isProject: boolean;
  public isJob: boolean;

  public AddClient = new Client(null, null, "", 1, null);
  public AddProject = new Project(null, null, "", null, null, null, 1, 0, null);
  public AddJob = new AddClientProject(null, null, null, null, null, null, null, null, "", false, true, null);

  public validationNewClient: string;
  public validationNewProject: string;
  public projectName: string;

  constructor(
    private clientService: ClientService,
    private projectService: ProjectService,
    private jobService: JobService,
    private userService: UserService,
    private router: Router,
    
   
  ) { }

  ngOnInit() {
    this.getClients();
    this.getUserByEmail(this.loggedInUserEmail);
    this.activeClient = true;
    this.isClient = true;
    this.clientformload = false;
    this.projectformload = false;
    this.addproject = false;
    this.activeProject = false;
    this.activeJob = false;
    this.noClients = false;
    this.noProject = false;
    this.noJobs = false;
    this.previouslink = "activeClient";
    
  }

  // ----------------- Gets User Id ----------------------
  public getUserByEmail(email) {
    this.userService.getUserByEmail(email)
      .subscribe(
        data => {
          this.AddClient.CreatedId = data[0].Id;
          this.AddProject.CreatedId = data[0].Id;
          this.AddJob.CreatedId = data[0].Id;
        },
        error => this.errorMessage = ""
      );
  }

  //----------------- Date formatting --------------------
  public formatDate(date) {
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

  // ------------------------- Gets all Clients ----------------------
  public getClients() {
    this.loadClient = true;
    this.loadingClients = true;
    this.clientService.getAllClients()
      .subscribe(
        data => {
          this.allClients = data;
          this.clients = this.allClients.filter(c => c.StatusId == 1);
          this.viewClients = this.allClients.filter(c => c.StatusId == 1);
          this.CompareClients = JSON.parse(JSON.stringify(this.allClients.filter(c => c.StatusId == 1)));
          this.loadingClients = false;

          if (this.clients.length == 0) {
            this.noClients = true;
          }
          else {
            this.noClients = false;
          }
          this.loadClient = false;
        },
        error => {
          this.loadingClients = false;
          this.errorMessage = ""
        });
  }

  //  ------------ Adding New Clients ----------------------------
  public onClientDataSubmit() {
    if (this.validateClient()) {
      this.updateClient = true;
      this.clientService.AddClient(this.AddClient)
        .then(
          data => {
            if (data) {
              if (data.status == "success") {
                this.getClients();
                this.AddJob.ClientId = data.recordset.output.InsertedId;
                this.AddJob.Client = this.AddClient.Name;

                if (this.AddClient.Id == null) {
                  this.onClientChange(this.AddJob.ClientId);
                }
                else {
                  this.addproject = false;
                  this.activeProject = false;
                  this.activeClient = true;
                  this.isClient = true;
                }
                this.showAlertMsg("alert-success", this.AddJob.Client + " Client Updated");
                this.clearClientform();
                this.updateClient = false;
              }
              else {
                this.errorMessage = "";
                this.updateClient = false;
              }
            }
          });
    }
  }

  //-------------- load Client form ------------
  public loadclientform() {
    this.validationNewClient = "";
    this.activeClient = false;
    this.activeProject = false;
    this.activeJob = false;
    this.projectformload = false;
    this.clientformload = true;
    this.AddClient = new Client(null, null, "", 1, this.AddClient.CreatedId);
  }

  //---------------Edit Client --------------------
  public EditClient(client) {
    if (client.StatusId == 2) {
      client.StatusId = false;
    }

    this.activeClient = false;
    this.clientformload = true;
    this.AddClient = new Client(client.Id, client.Name, client.Description, client.StatusId, this.AddClient.CreatedId);
  }

  // -----------------Validate Client form ----------------- 
  public validateClient() {
    let newclientvalidate: boolean;
    let duplicateclient: boolean;

    if (this.AddClient.Name == null || this.AddClient.Name.trim() == "") {
      this.validationNewClient = "Client name is required";
      newclientvalidate = false;
    } else {
      newclientvalidate = true;
      this.validationNewClient = "";
    }

    // ------------------------------ When Client Id is null (Adding new Client)------------------------------
    if (this.AddClient.Id == null) {
      for (let i = 0; i < this.allClients.length; i++) {
        if (this.AddClient.Name.toLowerCase().trim() == this.allClients[i].Name.toLowerCase().trim()) {
          this.showAlertMsg("alert-danger", "Duplicate Entry, Client name already exist");
          duplicateclient = false;
          return;
        }
        else {
          duplicateclient = true;
        }
      }
    }
    else {
      duplicateclient = true;
    }

    // ------------------------------ When Client Id is present (updating existing Client)------------------------------
    if (this.AddClient.Id) {
      if (this.AddClient.Name.trim() == "") {
        this.validationNewClient = "Client name is required";
        return;
      }
      else {
        this.validationNewClient = "";
        for (let i = 0; i < this.allClients.length; i++) {

          //--------------------- Checks for duplicate Entry -----------------------------
          if (this.AddClient.Id != this.allClients[i].Id) {
            if (this.AddClient.Name.toLowerCase().trim() == this.allClients[i].Name.toLowerCase().trim()) {
              this.showAlertMsg("alert-danger", "Duplicate Entry, Client name already exist");
              duplicateclient = false;
              return;
            }
            else {
              duplicateclient = true;
            }
          }
          //------------------------------- checks for any changes to update -------------------------
          else if (this.AddClient.Name.trim() == this.allClients[i].Name.trim() &&
            this.AddClient.Description.trim() == this.allClients[i].Description.trim() &&
            this.AddClient.StatusId == this.allClients[i].StatusId) {
            this.showAlertMsg("alert-danger", "No changes done to update " + this.AddClient.Name + " Client data.");
            return;
          }
        }
      }
    }
    return newclientvalidate && duplicateclient;
  }


  //------------------------ Cancel Client form -----------------
  public CancelClientform() {
    this[this.previouslink] = true;
    this.clientformload = false;
    this.AddClient = new Client(null, null, "", 1, this.AddClient.CreatedId);
    this.validationNewClient = "";
  }

  // --------------- Clear fields in Client form --------------------
  public clearClientform() {
    this.clientformload = false;
    this.AddClient = new Client(null, null, "", 1, this.AddClient.CreatedId);
    this.validationNewClient = "";
  }

  // ----------------- Gets all Projects based on Clients ---------------
  public onClientChange(newClientId) {
    this.AddJob = new AddClientProject(null, newClientId, this.AddJob.Client, null, null, null, null, null, "", false, true, this.AddJob.CreatedId);
    this.validationNewProject = "";
    this.validationErrorClient = "";
    this.validationErrorProject = "";
    this.validationErrorJob = "";
    this.clientformload = false;
    this.activeClient = false;
    this.activeJob = false;
    this.projectformload = false;
    this.loadingProjects = true;
    this.addproject = true;
    this.activeProject = true;
    this.loadProject = true;
    this.isProject = true;
    this.previouslink = "activeProject";
  
    for (let i = 0; i < this.clients.length; i++) {
      if (this.clients[i].Id == newClientId) {
        this.AddJob.Client = this.clients[i].Name;
        break;
      }
    }
  
    this.projectService.getProjectsByClient(newClientId)
      .subscribe(
        data => {
          this.allProjects = data;
          this.projects = this.allProjects.filter(project => project.StatusId == 1 && project.ClientId == newClientId);
          this.viewProjects = this.projects.slice();
          this.CompareProjects = JSON.parse(JSON.stringify(this.projects));
  
          if (this.projects.length == 0) {
            this.noProject = true;
          } else {
            this.noProject = false;
          }
  
          this.loadingProjects = false;
          this.loadProject = false;
        },
        error => {
          this.loadingProjects = false;
          this.errorMessage = "Projects data not found";
        }
      );
  }
  
  
  // ------------------Adding new project based on Client -------------------------

  public onProjectDataSubmit() {
    this.AddProject.ClientId = this.AddJob.ClientId;
  
    if (this.validateProject()) {
      this.updateProject = true;
      this.projectService.addProject(this.AddProject)
        .then(data => {
          if (data) {
            this.onClientChange(this.AddJob.ClientId);
            if (data.status == "success") {
              this.AddJob.ProjectId = data.recordset.output.InsertedId;
              this.AddJob.Project = this.AddProject.Name;
  
              if (this.AddProject.Id == null) {
                this.onProjectChange(this.AddJob.ProjectId);
                this.activeProject = false;
                this.activeJob = true;
              } else {
                this.activeProject = true;
              }
              this.showAlertMsg("alert-success", this.AddJob.Project + " Project Updated");
              this.clearProjectform();
              this.updateProject = false;
            }
          } else {
            this.errorMessage = "";
            this.updateProject = false;
          }
        })
        .catch(error => {
          console.error(error);
          this.updateProject = false;
        });
    }
  }
  
  
  //---------------Edit Project --------------------
  public Editproject(project) {

    if (project.StatusId == 2) {
      project.StatusId = false;
    }

    this.activeProject = false;
    this.activeClient = false;
    this.projectformload = true;
    this.AddProject = new Project(project.Id, project.Name, project.Description, null, null, project.ClientId, project.StatusId, project.projectType, this.AddClient.CreatedId);

  }

  //--------------- load project form ----------------------
  public loadprojectform() {
    this.validationNewProject = "";
    this.activeClient = false;
    this.activeProject = false;
    this.activeJob = false;
    this.clientformload = false;
    this.projectformload = true;
    this.AddProject = new Project(null, null, "", null, null, null, 1, 0, this.AddProject.CreatedId);
  }

  //------------------- Cancel Project form ---------------------
  public CancelProjectform() {
    this.validationNewClient = "";
    this.validationNewProject = "";
    this.projectformload = false;
    this.AddProject = new Project(null, null, "", null, null, null, 1, 0, this.AddClient.CreatedId);
    this[this.previouslink] = true;
  }

  // ---------------------- Clear fields in Project form --------------------------
  public clearProjectform() {
    this.projectformload = false;
    this.AddProject = new Project(null, null, "", null, null, null, 1, 0, this.AddProject.CreatedId);
    this.validationNewProject = "";
  }

  // -----------------Validate Client form ----------------- 
  public validateProject() {
    let newprojectvalidate: boolean;
    let duplicateproject: boolean;

    if (this.AddProject.Name == null || this.AddProject.Name.trim() == "") {
      this.validationNewProject = "Project name is required";
      newprojectvalidate = false;
    } else {
      newprojectvalidate = true;
      this.validationNewProject = "";
    }

    // ------------------------------ When project Id is null (Adding New project) ----------------------
    if (this.AddProject.Id == null) {
      if (this.projects.length) {
        for (let i = 0; i < this.allProjects.length; i++) {
          if (this.AddProject.ClientId == this.allProjects[i].ClientId &&
            this.AddProject.Name.toLowerCase().trim() == this.allProjects[i].Name.toLowerCase().trim()) {
            this.showAlertMsg("alert-danger", "Duplicate Entry, Project name already exist for the selected Client ");
            duplicateproject = false;
            return;
          }
          else {
            duplicateproject = true;
          }
        }
      }
      else {
        duplicateproject = true;
      }
    }
    else {
      duplicateproject = true;
    }

    // -------------------------------- When Id is present (Updating existing project) -----------------------------
    if (this.AddProject.Id) {
      if (this.AddProject.Name.trim() == "") {
        this.validationNewProject = "Project name is required";
        return;
      }
      else {
        this.validationNewProject = "";
        for (let i = 0; i < this.allProjects.length; i++) {

          // -------------------------- checks for duplicate entry ---------------------
          if (this.AddProject.Id != this.allProjects[i].Id) {
            if (this.AddProject.ClientId == this.allProjects[i].ClientId &&
              this.AddProject.Name.toLowerCase().trim() == this.allProjects[i].Name.toLowerCase().trim()) {
              this.showAlertMsg("alert-danger", "Duplicate Entry, Project name already exist for the selected Client ");
              duplicateproject = false;
              return;
            }
            else {
              duplicateproject = true;
            }
          }

          //------------------------- checks for any changes to update data ----------------------
          else if (this.AddProject.Name.trim() == this.allProjects[i].Name.trim() &&
            this.AddProject.Description.trim() == this.allProjects[i].Description.trim() &&
            this.AddProject.StatusId == this.allProjects[i].StatusId) {
            this.showAlertMsg("alert-danger", "No changes done to update " + this.AddProject.Name + " Project data.");
            duplicateproject = false;
            return;
          }
        }
      }
    }
    return newprojectvalidate && duplicateproject;
  }


  //-------------- Get all jobs ---------------------
  public onProjectChange(newProjectId) {

    this.validationErrorProject = "";
    this.validationErrorJob = "";
    this.AddJob.Id = null;
    this.AddJob.Job = null;
    this.AddJob.IsBillable = false;
    this.activeClient = false;
    this.activeProject = false;
    this.clientformload = false;
    this.projectformload = false;
    this.isJob = true;
    this.activeJob = true;
    this.loadJob = true;
    this.addproject = true;
    this.previouslink = "activeJob";

    for (let i = 0; i < this.projects.length; i++) {
      if (this.projects[i].Id == newProjectId) {
        this.AddJob.Project = this.projects[i].Name;
      }
    }

    this.jobService.getJobsByProject(newProjectId)
      .subscribe(
        data => {

          this.alljobs = data;
          this.jobs = this.alljobs.filter(c => c.StatusId == true);
          this.CompareJobs = JSON.parse(JSON.stringify(this.alljobs.filter(c => c.StatusId == true)));

          if (this.jobs.length == 0) {
            this.noJobs = true;
          }
          else {
            this.noJobs = false;
          }
          this.loadJob = false;
        },
        error => {
          this.errorMessage = "Jobs data not found";
        }
      );
  }

  //--------------------- Adding new Jobs based on Client and Project ----------------
  public onJobDataSubmit() {
    if (this.validateJob()) {
      this.updateJob = true;
      this.jobService.AddJob(this.AddJob)
        .then(
          data => {
            if (data) {
              this.showAlertMsg("alert-success", this.AddJob.Job + " Job Updated");
              this.addproject = true;
              this.clearForm();
              this.updateJob = false;
            }
            else {
              this.errorMessage = "";
              this.updateJob = false;
            }
          });
    }
  }

  public clearForm() {
    this.activeJob = true;
    this.clientformload = false;
    this.onProjectChange(this.AddJob.ProjectId);
    this.AddJob = new AddClientProject(null, this.AddJob.ClientId, this.AddJob.Client, this.AddJob.ProjectId, this.AddJob.Project, null, null, null, "", false, true, this.AddJob.CreatedId);
  }

  //---------------Edit Job --------------------
  public Editjob(job) {
    if (job.StatusId == 2) {
      job.StatusId = false;
    }

    this.validationErrorJob = "";
    this.activeProject = false;
    this.activeClient = false;
    this.projectformload = false;
    this.AddJob = new AddClientProject(job.Id, job.ClientId, this.AddJob.Client, job.ProjectId, this.AddJob.Project, job.Name, null, null, job.Description, job.IsBillable, job.StatusId, this.AddJob.CreatedId);
  }

  public Deletejob(job) {
    this.loader = job.Id;
    if (confirm("Are you sure to delete this item?")) {
      this.deleteJob = true;
      this.jobService.deleteJobEntry(job.Id)
        .then(
          data => {
            this.deleteJob = false;
            this.showAlertMsg("alert-success", job.Name + " Job deleted");
            if (data['Id'] != job.Id) {
              this.onProjectChange(this.AddJob.ProjectId);
            }
            else {
              this.showAlertMsg("alert-danger", job.Name + " Job cannot be deleted, since we have entries in the Timesheet for this job");
              return;
            }
          });
    }
  }

  //--------------------- Clear fields in Job form ----------------------
  public clearJobForm() {
    this.validationErrorClient = "";
    this.validationErrorProject = "";
    this.validationErrorJob = "";
    this.validationNewClient = "";
    this.validationNewProject = "";
    this.clientformload = false;
    this.projectformload = false;
    this.addproject = false;
    this.activeProject = false;
    this.activeJob = false;
    this.activeClient = true;
    this.AddClient = new Client(null, null, "", 1, this.AddClient.CreatedId);
    this.AddProject = new Project(null, null, "", null, null, null, 1, 0, this.AddProject.CreatedId);
    this.AddJob = new AddClientProject(null, null, null, null, null, null, null, null, "", false, true, this.AddJob.CreatedId);
    this.isClient = true;
    this.projects = null;
    this.previouslink = "activeClient";
  }

  //------------------ Cancel ---------------------
  public cancelJobForm() {
    this.addproject = true;
    this.validationErrorJob = "";
    this.AddJob = new AddClientProject(null, this.AddJob.ClientId, this.AddJob.Client, this.AddJob.ProjectId, this.AddJob.Project, "", null,
      this.AddJob.Date, "", false, true, this.AddJob.CreatedId)
  }

  //------------------- Validating Job form -----------------------
  public validateJob() {
    let clientValidated: boolean = false;
    let projectValidated: boolean = false;
    let jobValidated: boolean = false;
    let duplicatejob: boolean = false;

    if (!this.AddJob.ClientId) {
      this.validationErrorClient = "Client is required";
      clientValidated = false;
    } else {
      clientValidated = true;
      this.validationErrorClient = "";
    }

    if (!this.AddJob.ProjectId) {
      this.validationErrorProject = "Project is required";
      projectValidated = false;
    } else {
      projectValidated = true;
      this.validationErrorProject = "";
    }

    if (this.AddJob.Job == null || this.AddJob.Job.trim() == "") {
      this.validationErrorJob = "Job is required";
      jobValidated = false;
    } else {
      jobValidated = true;
      this.validationErrorJob = "";
    }


    // ------------------------- When Job Id is null (Adding new job) --------------------------
    if (this.AddJob.Id == null) {
      if (this.jobs.length) {
        for (let i = 0; i < this.alljobs.length; i++) {
          if (this.AddJob.ProjectId == this.alljobs[i].ProjectId &&
            this.AddJob.Job.toLowerCase().trim() == this.alljobs[i].Name.toLowerCase().trim()) {
            this.showAlertMsg("alert-danger", "Duplicate Entry, Job name already exist for the selected Client and Project");
            duplicatejob = false;
            return;
          }
          else {
            duplicatejob = true;
          }
        }
      }
      else {
        duplicatejob = true;
      }
    }
    else {
      duplicatejob = true;
    }


    // ----------------------------When Job Id is present (Updating Job) -----------------------------
    if (this.AddJob.Id) {
      if (this.AddJob.Job.trim() == "") {
        this.validationErrorJob = "Job name is required";
        return;
      }
      else {
        this.validationErrorJob = "";
        for (let i = 0; i < this.alljobs.length; i++) {
          // -------------------- checks the duplicate entry ----------------------------
          if (this.AddJob.Id != this.alljobs[i].Id) {
            if (this.AddJob.ProjectId == this.alljobs[i].ProjectId &&
              this.AddJob.Job.toLowerCase().trim() == this.alljobs[i].Name.toLowerCase().trim()) {
              this.showAlertMsg("alert-danger", "Duplicate Entry, Job name already exist for the selected Client and Project");
              duplicatejob = false;
              return;
            }
            else {
              duplicatejob = true;
            }
          }
          // ------------------- checks for any changes to update data -----------------------
          else if (this.AddJob.Job.trim() == this.alljobs[i].Name.trim() &&
            this.AddJob.Description.trim() == this.alljobs[i].Description.trim() &&
            this.AddJob.IsBillable == this.alljobs[i].IsBillable &&
            this.AddJob.StatusId == this.alljobs[i].StatusId) {
            this.showAlertMsg("alert-danger", "No changes done to update " + this.AddJob.Job + " Job data.");
            return;
          }
        }
      }
    }
    return projectValidated && clientValidated && jobValidated && duplicatejob;
  }


  public showAlertMsg(type: string, msg: string): void {
    this.alertClass = type;
    this.successMessage = msg;

    setTimeout(() => {
      this.successMessage = "";
    }, 3500);
  }

  public onActiveClientChange(event) {
    if (event.target.checked) {
      this.viewClients = this.allClients.filter(c => Number(c.StatusId) == 1);
      this.isClient = true;
      if (this.viewClients.length == 0) {
        this.noClients = true;
      }
      else {
        this.noClients = false;
      }
    }
    else {
      this.viewClients = this.allClients.filter(c => Number(c.StatusId) == 2 || c.StatusId == 0);
      this.isClient = false;
      if (this.viewClients.length == 0) {
        this.noClients = true;
      }
      else {
        this.noClients = false;
      }
    }
  }

  public onActiveProjectChange(event) {
    if (event.target.checked) {
      this.viewProjects = this.allProjects.filter(c => Number(c.StatusId) == 1);
      this.isProject = true;
      if (this.viewProjects.length == 0) {
        this.noProject = true;
      }
      else {
        this.noProject = false;
      }
    }
    else {
      this.viewProjects = this.allProjects.filter(c => Number(c.StatusId) == 2 || c.StatusId == 0);
      this.isProject = false;
      if (this.viewProjects.length == 0) {
        this.noProject = true;
      }
      else {
        this.noProject = false;
      }
    }
  }

  public onActiveJobChange(event) {
    if (event.target.checked) {
      this.jobs = this.alljobs.filter(c => Number(c.StatusId) == 1);
      this.isJob = true;
      if (this.jobs.length == 0) {
        this.noJobs = true;
      }
      else {
        this.noJobs = false;
      }
    }
    else {
      this.jobs = this.alljobs.filter(c => Number(c.StatusId) == 2 || c.StatusId == false);
      this.isJob = false;
      if (this.jobs.length == 0) {
        this.noJobs = true;
      }
      else {
        this.noJobs = false;
      }
    }
  }

  public onProjectTypeChange(value) {
    this.AddProject.projectType = value;
  }
}
