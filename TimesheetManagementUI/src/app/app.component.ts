import { Component } from '@angular/core';
import {environment} from 'environments/environment';
import { Router }     from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  loggedIn = false;
  loggedInUser = null; 
  isAdmin = false;

  constructor(
    private router : Router
  ) { }


  ngOnInit() {
    this.loggedIn = localStorage.getItem('currentUser') ? true : false;
    this.isAdmin = localStorage.getItem('userRoleId') == "2" ? true : false;
    this.loggedInUser = JSON.parse(localStorage.getItem('currentUser')) != null ? JSON.parse(localStorage.getItem('currentUser')).username : null;
  }

  ngDoCheck(){
    this.loggedIn = localStorage.getItem('currentUser') ? true : false;
    this.isAdmin = localStorage.getItem('userRoleId') == "2" ? true : false;
    this.loggedInUser = JSON.parse(localStorage.getItem('currentUser')) != null ? JSON.parse(localStorage.getItem('currentUser')).username : null;
  }

  login() {
    window.open(environment.origin + '/auth/login', "_self");
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRoleId');
    this.router.navigate(['/login']);
  }

  weeklyTimesheet()
  {
    this.router.navigate(['/weeklyTimesheetEntry']);
  }
}
