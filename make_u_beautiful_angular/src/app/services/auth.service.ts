import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {BehaviorSubject, Subject, throwError} from 'rxjs';
import {Router} from '@angular/router';
// global.ts file is created in shared folder to store all global variables.
import {User} from '../models/user.model';
import {environment} from '../../environments/environment';
import {ErrorService} from './error.service';

export interface AuthResponseData {
  success: number;
  data: {
    user: User;
    token: string;
  };
  message: string;
}


@Injectable({
  providedIn: 'root'
})
// @ts-ignore
export class AuthService {
  private BASE_API_URL = environment.BASE_API_URL;
  userBehaviorSubject = new BehaviorSubject<User>(null);
  constructor(private  http: HttpClient, private router: Router, private errorService: ErrorService) { }

  isAuthenticated(){
    if (this.userBehaviorSubject.value){
      return true;
    }else{
      return false;
    }
  }
  isNotAuthenticated(){
    if (this.userBehaviorSubject.value){
      return false;
    }else{
      return true;
    }
  }
  isOwner(){
    if (this.userBehaviorSubject.value && this.userBehaviorSubject.value.isOwner){
      return true;
    }else{
      return false;
    }
  }
  isAdmin(){
    if (this.userBehaviorSubject.value && this.userBehaviorSubject.value.isAdmin){
     return true;
    }else{
      return false;
    }
  }
  isDeveloper(): boolean{
    if (this.userBehaviorSubject.value && this.userBehaviorSubject.value.isDeveloper){
      return true;
    }else{
      return false;
    }
  }
  isStudent(): boolean{
    if (this.userBehaviorSubject.value && this.userBehaviorSubject.value.isStudent){
      return true;
    }else{
      return false;
    }
  }

  autoLogin(){

    const userData: User = JSON.parse(localStorage.getItem('user'));
    if (!userData){
      return;
    }else{
      // tslint:disable-next-line:max-line-length
      this.http.get(this.BASE_API_URL + '/me').subscribe(response => {
        console.log(response);
      });
      const loadedUser = new User(userData.uniqueId, userData.userName, userData._authKey, userData.userTypeId, userData.userTypeName);
      if (loadedUser.authKey){
        this.userBehaviorSubject.next(loadedUser);
      }
    }
    // tslint:disable-next-line:max-line-length
  }


  login(loginData){
    return this.http.post<AuthResponseData>(this.BASE_API_URL + '/login', loginData)
        .pipe(catchError(this.errorService.serverError), tap(resData => {
          // tslint:disable-next-line:max-line-length
          if (resData.success === 1){
            const user = new User(resData.data.user.uniqueId,
                resData.data.user.userName,
                resData.data.token,
                resData.data.user.userTypeId,
                resData.data.user.userTypeName);
            this.userBehaviorSubject.next(user);
            localStorage.setItem('user', JSON.stringify(user));
          }
        }));  // this.handleError is a method created by me
  }


  private serverError(err: any) {
    if (err instanceof Response) {
      return throwError('backend server error');
      // if you're using lite-server, use the following line
      // instead of the line above:
      // return Observable.throw(err.text() || 'backend server error');
    }
    if (err.status === 0){
      // tslint:disable-next-line:label-position
      return throwError ({status: err.status, message: 'Backend Server is not Working', statusText: err.statusText});
    }
    if (err.status === 401){
      // tslint:disable-next-line:label-position
      return throwError ({status: err.status, message: 'Your are not authorised', statusText: err.statusText});
    }
    return throwError(err);
  }
  private handleError(errorResponse: HttpErrorResponse){
    if (errorResponse.error.message.includes('1062')){
      return throwError('Record already exists');
    }else {
      return throwError(errorResponse.error.message);
    }
  }

  redirectToRoot(){
    this.router.navigate(['/']).then(r => {
      if (r) {
        location.reload();
      }
    });
  }

  logout(){
    // this.userBehaviorSubject.next(null);
    // localStorage.removeItem('user');
    this.http.get<any>(this.BASE_API_URL + '/logout').subscribe( response => {
      this.userBehaviorSubject.next(null);
      localStorage.removeItem('user');
      this.router.navigate(['/']).then(r => {
        if (r) {
          location.reload();
        }
      });
      }, (error) => {
        console.log('logout with error', error);
        this.userBehaviorSubject.next(null);
        localStorage.removeItem('user');
        this.router.navigate(['/']).then(r => {
          if (r) {
            location.reload();
          }
        });
    });

  }

    logoutAll() {
      // this.userBehaviorSubject.next(null);
      // localStorage.removeItem('user');
      this.http.get<any>(this.BASE_API_URL + '/revokeAll').subscribe( response => {
        this.userBehaviorSubject.next(null);
        localStorage.removeItem('user');
        this.router.navigate(['/']).then(r => {
          if (r) {
            location.reload();
          }
        });
      }, (error) => {
        console.log('logout with error', error);
        this.userBehaviorSubject.next(null);
        localStorage.removeItem('user');
        this.router.navigate(['/']).then(r => {
          if (r) {
            location.reload();
          }
        });
      });
    }
}
