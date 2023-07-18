import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Timesheet } from 'app/models/timesheet';
import { TimeAllocation } from 'app/models/timeAllocation';
import { TimeAllocationDetails } from 'app/models/timeAllocationdetails';
import { environment } from 'environments/environment';

@Injectable()
export class TimeAllocationService {

  private serviceUrl = environment.origin;
  private currentUser = JSON.parse(localStorage.getItem('currentUser'));
  private token = this.currentUser && this.currentUser.token;
  private key = this.currentUser && this.currentUser.username;

  constructor(private http: Http) { }

  addAllocationDetails(timeAllocated: TimeAllocation, operation: string): Promise<boolean> {
    return this.http.post(this.serviceUrl + `/api/v1/timeAllocation/addAllocationDetails/${operation}?access_token=${this.token}&x_key=${this.key}`, timeAllocated).toPromise()
      .then(this.extractAllocationStatus)
      .catch(this.handleError);
  }

  deleteAllocationDetails(id): Promise<boolean> {
    return this.http.delete(this.serviceUrl + '/api/v1/timeAllocation/deleteAllocationDetails/' + id + '?access_token='+ this.token + "&x_key=" + this.key).toPromise()
      .then(this.extractAllocationStatus)
      .catch(this.handleError);
  }

  private extractAllocationStatus(res: Response) {
    let body = res.json();
    if (body.status == "success") {
      return true;
    }
    return false;
  }

  private handleError(error: Response | any) {    
    return false;
  }

  //  --------------------  Get Time Allocation Details  ------------------------------------
  getAllocationDetails(): Observable<TimeAllocationDetails[]> {
    return this.http.get(this.serviceUrl + '/api/v1/timeAllocation/getAllocationDetails?access_token=' + this.token + "&x_key=" + this.key)
      .map(this.extractAllocationData)
      .catch(this.handleAllocationError);
  }

    getTimesheet(clientId, projectId): Observable<Timesheet[]> {
    return this.http.get(this.serviceUrl + '/api/v1/timeAllocation/getTimesheet/'+ clientId + '/' + projectId + '/'+ '?access_token='+ this.token + "&x_key=" + this.key)
      .map(this.extractAllocationData)
      .catch(this.handleAllocationError);
  }

  private extractAllocationData(res: Response) {
    let body = res.json();
    return body.timeAllocation
      || {};
  }

  private handleAllocationError(error: Response | any) {    
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
