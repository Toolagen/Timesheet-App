import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from 'app/services/user.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
    public loggedInUserEmail : string = JSON.parse(localStorage.getItem('currentUser')).username;
    constructor(private router: Router,
                private userService : UserService) { }

    canActivate() {
        if(localStorage.getItem('userRoleId') == "2"){
            return true;
        }
        else{
            this.router.navigate(['/']);
            return false;
        }
    }
}