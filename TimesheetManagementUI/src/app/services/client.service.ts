import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Client } from '../models/client';
import { environment } from 'environments/environment';

@Injectable()
export class ClientService {

  private serviceUrl = environment.origin;

  private currentUser = JSON.parse(localStorage.getItem('currentUser'));
  private token = this.currentUser && this.currentUser.token;
  private key = this.currentUser && this.currentUser.username;

  constructor(private http: Http) { }

  AddClient(AddClient: Client): Promise<any> {
    return this.http.post(this.serviceUrl + '/api/v1/clients/add?access_token='+ this.token + "&x_key=" + this.key, AddClient).toPromise()
      .then(this.extractClientStatus)
      .catch(this.handleError);
  }

  private extractClientStatus(res: Response) {
    let body = res.json();        
      return body;    
  }

  private handleError(error: Response | any) {
    //Log error
    return false;
  }

  getAllClients(): Observable<Client[]> {     
      return this.http.get(this.serviceUrl + '/api/v1/clients/getAll?access_token='+ this.token + "&x_key=" + this.key)
          .map(this.extractClientsData)
          .catch(this.handleClientError);
  }

  private extractClientsData(res: Response) {
      let body = res.json();
      return body.clients
          || {};
  }

  private handleClientError(error: Response | any) {
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
