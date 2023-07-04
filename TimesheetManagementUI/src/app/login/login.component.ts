import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/services/authentication.service';
import { Router, ActivatedRoute, Params }     from '@angular/router';
import {environment} from 'environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [AuthenticationService],
})
export class LoginComponent implements OnInit {

  constructor(
    private authenticationService : AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private router : Router
  ) { }

  ngOnInit() {
    //window.location.reload();
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      localStorage.removeItem('currentUser');
      let token = params['token'];
      let key = params['key'];
      if(token && key){
        localStorage.setItem('currentUser', JSON.stringify({ username: key, token: token }));
        this.router.navigate(['/']);
      }
    });
  }

  // ngAfterViewInit(){
  //   window.location.reload();
  // }
  

  login() {
    window.open(environment.origin + '/login', "_self");
  }
}
