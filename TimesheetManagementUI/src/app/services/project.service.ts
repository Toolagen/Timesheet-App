import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Project } from '../models/project';

import { environment } from 'environments/environment';

@Injectable()
export class ProjectService {

  private serviceUrl = environment.origin;
  private currentUser = JSON.parse(localStorage.getItem('currentUser'));
  private token = this.currentUser && this.currentUser.token;
  private key = this.currentUser && this.currentUser.username;

  constructor(private http: Http) { }

  addProject(project: Project): Promise<any> {
    const url = `${this.serviceUrl}/api/v1/projects/add?access_token=${this.token}&x_key=${this.key}`;
    return this.http.post(url, project)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  getAllProjects(): Observable<Project[]> {
    const url = `${this.serviceUrl}/api/v1/projects/getAll?access_token=${this.token}&x_key=${this.key}`;
    return this.http.get(url)
      .pipe(
        map(this.extractData),
        catchError(this.handleProjectError) // Corrected method name
      );
  }
  getInactiveProjectsClients(): Observable<Project[]> {
    const url = `${this.serviceUrl}/api/v1/projects/getInactiveProjectsClients?access_token=${this.token}&x_key=${this.key}`;
    return this.http.get(url)
      .pipe(
        map(this.extractData),
        catchError(this.handleProjectError) // Corrected method name
      );
  }
  getActiveProjectsClients(): Observable<Project[]> {
    const url = `${this.serviceUrl}/api/v1/projects/getActiveProjectsClients?access_token=${this.token}&x_key=${this.key}`;
    return this.http.get(url)
      .pipe(
        map(this.extractData),
        catchError(this.handleProjectError) // Corrected method name
      );
  }
  getInactiveProjectsInactiveClients(): Observable<Project[]> {
    const url = `${this.serviceUrl}/api/v1/projects/getInactiveProjectsInactiveClients?access_token=${this.token}&x_key=${this.key}`;
    return this.http.get(url)
      .pipe(
        map(this.extractData),
        catchError(this.handleProjectError) // Corrected method name
      );
  }

  getProjectsByClient(clientId): Observable<Project[]> {
    const url = `${this.serviceUrl}/api/v1/projects/getByClient/${clientId}?access_token=${this.token}&x_key=${this.key}`;
    return this.http.get(url)
      .pipe(
        map(this.extractData),
        catchError(this.handleProjectError) // Corrected method name
      );
  }

  private extractData(res: Response) {
    const body = res.json();
    return body.projects || {};
  }

  private handleError(error: Response | any) {
    console.error(error);
    return false;
  }

  private handleProjectError(error: Response | any) { // Corrected method name
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
