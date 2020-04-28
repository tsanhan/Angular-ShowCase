import { Actions, ofType, Effect, createEffect } from "@ngrx/effects";

import * as AuthActions from "./auth.actions";
import { switchMap, catchError, tap, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from "../../../environments/environment";
import { of } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../user.model';
import { AuthService } from '../auth.service';


export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const handleAuthentication = (resData: AuthResponseData) => {
  const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);

  const user = new User(resData.email, resData.localId, resData.idToken, expirationDate);

  localStorage.setItem('userData', JSON.stringify(user));

  return AuthActions.authenticateSuccess({
    email: resData.email,
    token: resData.idToken,
    expirationDate: expirationDate,
    userId: resData.localId,
    redirect: true
  });
}

const handleError = (errorRes: HttpErrorResponse) => {
  let errorMessage = 'An unknown error occurred!';
  if (!errorRes.error || !errorRes.error.error) {
    return of(AuthActions.authenticateFail({errorMessage}));
  }
  switch (errorRes.error.error.message) {
    case 'EMAIL_EXISTS':
      errorMessage = 'This email exists already';
      break;
    case 'EMAIL_NOT_FOUND':
      errorMessage = 'This email does not exist.';
      break;
    case 'INVALID_PASSWORD':
      errorMessage = 'This password is not correct.';
      break;
  }
  return of(AuthActions.authenticateFail({errorMessage}));
}

@Injectable()
export class AuthEffects {


  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService) { }

  // @Effect()
  // authSignup = this.actions$.pipe(
  //   ofType(AuthActions.SIGNUP_START),
  //   switchMap((signupAction: AuthActions.SignUpStart) => {
  //     return this.http
  //       .post<AuthResponseData>(
  //         `https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=${environment.apiKey}`,
  //         {
  //           email: signupAction.payload.email,
  //           password: signupAction.payload.password,
  //           returnSecureToken: true
  //         }
  //       ).pipe(
  //         tap((resData) => this.authService.setLogoutTimer(+resData.expiresIn * 1000)),
  //         map(handleAuthentication.bind(this)),
  //         catchError(handleError.bind(this))
  //       )
  //   }),
  // )

  authSignup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signupStart),
      switchMap(action => {
        return this.http
          .post<AuthResponseData>(
            `https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=${environment.apiKey}`,
            {
              email: action.email,
              password: action.password,
              returnSecureToken: true
            }
          ).pipe(
            tap((resData) => this.authService.setLogoutTimer(+resData.expiresIn * 1000)),
            map(handleAuthentication.bind(this)),
            catchError(handleError.bind(this))
          )
      })

    )
  )

  // @Effect()
  // authLogin = this.actions$.pipe(
  //   ofType(AuthActions.LOGIN_START),
  //   switchMap((authData: AuthActions.LoginStart) => {
  //     return this.http
  //       .post<AuthResponseData>(
  //         `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${environment.apiKey}`,
  //         {
  //           email: authData.payload.email,
  //           password: authData.payload.password,
  //           returnSecureToken: true
  //         }
  //       ).pipe(
  //         tap((resData) => this.authService.setLogoutTimer(+resData.expiresIn * 1000)),
  //         map(handleAuthentication.bind(this)),
  //         catchError(handleError.bind(this))
  //       )
  //   }),
  // );

  authLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginStart),
      switchMap(action => {
        return this.http
          .post<AuthResponseData>(
            `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${environment.apiKey}`,
            {
              email: action.email,
              password: action.password,
              returnSecureToken: true
            }
          ).pipe(
            tap((resData) => this.authService.setLogoutTimer(+resData.expiresIn * 1000)),
            map(handleAuthentication.bind(this)),
            catchError(handleError.bind(this))
          )
      }),
    ))

  // @Effect({ dispatch: false })
  // authRedirect = this.actions$.pipe(
  //   ofType(AuthActions.AUTHENTICATE_SUCCESS),
  //   tap((authSuccessAction: AuthActions.AuthenticateSuccess) => {
  //     if (authSuccessAction.payload.redirect)
  //       this.router.navigate(['/'])
  //   })
  // )

  authRedirect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.authenticateSuccess),
      tap(action => action.redirect && this.router.navigate(['/']))
    ), { dispatch: false })

  // @Effect({ dispatch: false })
  // authLogOut = this.actions$.pipe(
  //   ofType(AuthActions.LOGOUT),
  //   tap(() => {
  //     this.authService.clearLogoutTimer();
  //     localStorage.removeItem('userData');
  //     this.router.navigate(['/auth']);
  //   })
  // )

  authLogOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.authService.clearLogoutTimer();
        localStorage.removeItem('userData');
        this.router.navigate(['/auth']);
      })
    ),{ dispatch: false}
  );


  // @Effect()
  // autoLogin = this.actions$.pipe(
  //   ofType(AuthActions.AUTO_LOGIN),
  //   map(() => {
  //     const userData: {
  //       email: string;
  //       id: string;
  //       _token: string;
  //       _tokenExpirationDate: string;
  //     } = JSON.parse(localStorage.getItem('userData'));
  //     if (!userData) {
  //       return {
  //         type: 'DUMMY'
  //       }
  //     }

  //     const loadedUser = new User(
  //       userData.email,
  //       userData.id,
  //       userData._token,
  //       new Date(userData._tokenExpirationDate)
  //     );

  //     if (loadedUser.token) {
  //       const expirationDuration =
  //         new Date(userData._tokenExpirationDate).getTime() -
  //         new Date().getTime();
  //       this.authService.setLogoutTimer(expirationDuration);
  //       return new AuthActions.AuthenticateSuccess({
  //         email: loadedUser.email,
  //         token: loadedUser.token,
  //         userId: loadedUser.id,
  //         expirationDate: new Date(userData._tokenExpirationDate),
  //         redirect: false
  //       });
  //     }
  //     return {
  //       type: 'DUMMY'
  //     }
  //     //this.user.next(loadedUser);
  //     // const expirationDuration =
  //     //   new Date(userData._tokenExpirationDate).getTime() -
  //     //   new Date().getTime();
  //     // this.autoLogout(expirationDuration);
  //   })
  // )

  autoLogin$ =createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.autoLogin),
      map(() => {
        const userData: {
          email: string;
          id: string;
          _token: string;
          _tokenExpirationDate: string;
        } = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
          return {
            type: 'DUMMY'
          }
        }

        const loadedUser = new User(
          userData.email,
          userData.id,
          userData._token,
          new Date(userData._tokenExpirationDate)
        );

        if (loadedUser.token) {
          const expirationDuration =
            new Date(userData._tokenExpirationDate).getTime() -
            new Date().getTime();
          this.authService.setLogoutTimer(expirationDuration);
          return AuthActions.authenticateSuccess({
            email: loadedUser.email,
            token: loadedUser.token,
            userId: loadedUser.id,
            expirationDate: new Date(userData._tokenExpirationDate),
            redirect: false
          });
        }
        return {
          type: 'DUMMY'
        }
        //this.user.next(loadedUser);
        // const expirationDuration =
        //   new Date(userData._tokenExpirationDate).getTime() -
        //   new Date().getTime();
        // this.autoLogout(expirationDuration);
      })
    )
  );


}


