import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Headers, Response, RequestOptions } from '@angular/http';

@Injectable()
export class AuthenticationService {
  public token: string;
  public key : string;

  constructor(private http: Http) { 
    // set token if saved in local storage
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.key = currentUser && currentUser.username;
  }

  // login() : Observable<boolean>{
  //   return this.http.get('https://tg-servce-timesheet.azurewebsites.net/login')
  //     .map((response: Response) => {
  //       // login successful if there's a jwt token in the response

  //       let token = response.json() && response.json().token;
  //       let username = response.json() && response.json().username;
  //       if (token) {
  //         // set token property
  //         this.token = token;

  //         // store username and jwt token in local storage to keep user logged in between page refreshes
  //         localStorage.setItem('currentUser', JSON.stringify({ username: username, token: token }));

  //         // return true to indicate successful login
  //         return true;
  //       } else {
  //         // return false to indicate failed login
  //         return false;
  //       }
  //     })
  //     .catch((error: Response) => {
  //       return Observable.throw(false);
  //     });
  // }

}
