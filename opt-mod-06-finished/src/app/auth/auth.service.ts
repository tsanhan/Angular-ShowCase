import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

import { Store } from '@ngrx/store';
import * as fromApp from "../store/app.reducer";
import * as AuthActions from "./store/auth.actions";


@Injectable({ providedIn: 'root' })
export class AuthService {
  //user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: any;

  constructor(
    private store: Store<fromApp.AppState>) { }


  setLogoutTimer(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.store.dispatch( AuthActions.logout())
    }, expirationDuration);
  }


  clearLogoutTimer(){
    if(this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }


}
