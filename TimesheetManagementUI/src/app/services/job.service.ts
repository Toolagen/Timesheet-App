import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Job } from '../models/job';
import { AddClientProject } from '../models/addClientProject';
import { environment } from 'environments/environment';

@Injectable()
export class JobService {
 
  private serviceUrl = environment.origin;

  private currentUser = JSON.parse(localStorage.getItem('currentUser'));
  private token = this.currentUser && this.currentUser.token;
  private key = this.currentUser && this.currentUser.username;

  constructor(private http : Http) { }

  AddJob(AddJob: AddClientProject): Promise<boolean> {
    return this.http.post(this.serviceUrl + '/api/v1/jobs/add?access_token='+ this.token + "&x_key=" + this.key, AddJob).toPromise()
      .then(this.extractJobStatus)
      .catch(this.handleError);
  }

  deleteJobEntry(id): Promise<object> {
    return this.http.delete(this.serviceUrl + '/api/v1/jobs/deleteJobEntry/' + id + '?access_token='+ this.token + "&x_key=" + this.key).toPromise()
      .then(this.extractAllJobsData)
      .catch(this.handleError);
  }

  private extractJobStatus(res: Response) {
    let body = res.json();
    if(body.status == "success"){
      return true;
    }
    return false;
  }

  private handleError(error: Response | any) {    
    return false;
  }

   getAllJobs(): Observable<Job[]> {
        return this.http.get(this.serviceUrl + '/api/v1/jobs/getAll?access_token='+ this.token + "&x_key=" + this.key)
            .map(this.extractAllJobsData)
            .catch(this.handleJobError);
    }

    private extractAllJobsData(res: Response) {
        let body = res.json();
        return body.jobs
            || {};
    }

    
    getJobsByProject(projectId): Observable<Job[]> {
        return this.http.get(this.serviceUrl + '/api/v1/jobs/getByProject/' + projectId + '?access_token='+ this.token + "&x_key=" + this.key)
            .map(this.extractProjectWiseJobsData)
            .catch(this.handleJobError);
    }

    private extractProjectWiseJobsData(res: Response){
        let body = res.json();
        return body.jobs
            || {};
    }

    private handleJobError(error: Response | any) {
        //Log error
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${ error.status } - ${ error.statusText || '' } ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }


}
