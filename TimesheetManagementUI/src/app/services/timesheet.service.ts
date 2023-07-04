import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Timesheet } from 'app/models/timesheet';
import { TimesheetGrid } from 'app/models/timesheet-grid';

import { environment } from 'environments/environment';
import { WeeklyTimeSheetDisplay } from '../models/weeklyTimeSheetDisplay';

@Injectable()
export class TimesheetService {

  private serviceUrl = environment.origin;

  private currentUser = JSON.parse(localStorage.getItem('currentUser'));
  private token = this.currentUser && this.currentUser.token;
  private key = this.currentUser && this.currentUser.username;
  
  constructor(private http : Http) { }

  addTimesheet(timesheet: Timesheet): Promise<boolean> {
    return this.http.post(this.serviceUrl + '/api/v1/timesheet/add?access_token='+ this.token + "&x_key=" + this.key, timesheet).toPromise()
      .then(this.extractTimesheetStatus)
      .catch(this.handleError);
  }

  //----------------------NEW--------------------
  addTimesheets(NewEntrytimesheet: Timesheet[]): Promise<boolean> {
    return this.http.post(this.serviceUrl + '/api/v1/timesheet/addMultipleRows?access_token='+ this.token + "&x_key=" + this.key, NewEntrytimesheet).toPromise()
      .then(this.extractTimesheetStatus)
      .catch(this.handleError);
  }
  //-----------------------------------------------

  getTimeSheetGridData(): Observable<TimesheetGrid[]>{
    return this.http.get(this.serviceUrl + '/api/v1/timesheet/getAllData?access_token='+ this.token + "&x_key=" + this.key)
      .map(this.extractTimesheetGridData)
      .catch(this.handleErrorGetTimesheetData);
  }

  getTimeSheetGridDataByDate(workdate): Observable<TimesheetGrid[]>{
    return this.http.get(this.serviceUrl + '/api/v1/timesheet/getDataByDate/' + workdate + '?access_token='+ this.token + "&x_key=" + this.key)
      .map(this.extractTimesheetGridData)
      .catch(this.handleErrorGetTimesheetData);
  }

 getUserTimesheetDataByWeek(createdid, fromdate, todate): Observable<TimesheetGrid[]>{
    return this.http.get(this.serviceUrl + '/api/v1/timesheet/getDataByfromtoDate/'+ createdid +'/' + fromdate + '/'+ todate + '?access_token='+ this.token + "&x_key=" + this.key)
      .map(this.extractTimesheetGridData)                     
      .catch(this.handleErrorGetTimesheetData);
  }


  //-------------NEW----------------------
  getUserWeeklyTimesheetData(fromdate, createdId): Observable<WeeklyTimeSheetDisplay[]>{
    return this.http.get(this.serviceUrl + '/api/v1/timesheet/getDataByfromDate/'  + fromdate + '/' + createdId + '/'+ '?access_token='+ this.token + "&x_key=" + this.key)
      .map(this.extractTimesheetGridData)                     
      .catch(this.handleErrorGetTimesheetData);
  }

  deleteTimeSheetEntries(id : number[]): Promise<boolean> {
    return this.http.post(this.serviceUrl + '/api/v1/timesheet/deleteTimesheetEntries?access_token='+ this.token + "&x_key=" + this.key, id).toPromise()
      .then(this.extractTimesheetStatus)
      .catch(this.handleError);
  }
  //--------------------------------------
  
  deleteTimeSheetEntry(id): Promise<boolean> {
    return this.http.delete(this.serviceUrl + '/api/v1/timesheet/deleteTimesheet/' + id + '?access_token='+ this.token + "&x_key=" + this.key).toPromise()
      .then(this.extractTimesheetStatus)
      .catch(this.handleError);
  }

  //Service for Admin Report
  getAllTimesheetDataByDateRange(fromdate, todate): Observable<TimesheetGrid[]>{
    return this.http.get(this.serviceUrl + '/api/v1/timesheet/getAllDataByDateRange/'+ fromdate + '/'+ todate + '?access_token='+ this.token + "&x_key=" + this.key)
      .map(this.extractTimesheetGridData)                     
      .catch(this.handleErrorGetTimesheetData);
  }
  private extractTimesheetStatus(res: Response) {
    let body = res.json();
    if(body.status == "success"){
      return true;
    }
    return false;
  }

  private extractTimesheetGridData(res: Response){
    let body = res.json();
        return body.timesheets        
          || {};
  }

  private handleError(error: Response | any) {
    //Log error
    return false;
  }

  private handleErrorGetTimesheetData(error: Response | any) {
    //Log error
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
