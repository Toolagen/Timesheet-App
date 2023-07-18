import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { User } from 'app/models/user';
import { environment } from 'environments/environment';

@Injectable()
export class UserService {

    private serviceUrl = environment.origin;
  
    private currentUser = JSON.parse(localStorage.getItem('currentUser'));
    private token = this.currentUser && this.currentUser.token;
    private key = this.currentUser && this.currentUser.username;
    //static userRoleId = 1;

  constructor(private http : Http) { }

  // getAllUsers(){
  //   // Dev users
  //   var User1 = new User(1, "Amar Galla");
  //   var User2 = new User(2, "Karthikeyan V");
  //   var User3 = new User(4, "Ragavendra");
  //   var User4 = new User(5, "Sharad");
  //   var User5 = new User(6, "Malatesh");
  //   var user6 = new User(7, "Amar Swami");
  //   var user7 = new User(8, "Gayathri");
  //   var user8 = new User(9, "Urmila");
  //   var user9 = new User(10, "Pavitra");
  //   var user10 = new User(11, "Muttanagouda");
  //   var user11 = new User(17, "Priyanka");

  //   //Live users
  //   // var User1 = new User(6, "Amar Galla");
  //   // var User2 = new User(7, "Karthikeyan V");
  //   // var User3 = new User(8, "Ragavendra");
  //   // var User4 = new User(9, "Sharad");
  //   // var User5 = new User(10, "Malatesh");
  //   // var user6 = new User(11, "Amar Swami");
  //   // var user7 = new User(12, "Gayathri");
  //   // var user8 = new User(13, "Urmila");
  //   // var user9 = new User(16, "Pavitra");
  //   // var user10 = new User(15, "Muttanagouda");
  //   // var user11 = new User(17, "Priyanka");

  //   var Users = [User1, User2, User3, User4, User5, user6, user7, user8, user9, user10, user11];

  //   return Users;
  // }

  getUserByEmail(email){
    return this.http.get(this.serviceUrl + '/api/v1/users/getByUserEmail/' + email + '?access_token='+ this.token + "&x_key=" + this.key)
    .map(this.extractUserData)
    .catch(this.handleError);
  }
  //Get All Users
  getAllUsers(): Observable<User[]> {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let token = currentUser && currentUser.token;
    let key = currentUser && currentUser.username;
   
    return this.http.get(this.serviceUrl + '/api/v1/users/getAll?access_token='+ token + "&x_key=" + key)
        .map(this.extractAllUserData)
        .catch(this.handleError);
}

  private extractUserData(res: Response) {
    let body = res.json();
    localStorage.setItem('userRoleId', body.user[0].RoleId);
    //UserService.userRoleId = body.user[0].RoleId;
    return body.user
      || {};
  }

  private extractAllUserData(res: Response) {
    let body = res.json();
    return body.user
        || {};
}
  private handleError(error: Response | any) {
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
