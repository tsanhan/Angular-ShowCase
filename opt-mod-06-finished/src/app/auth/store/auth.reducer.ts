import { User } from '../user.model';
import * as AuthActions from './auth.actions';
import { Action, createReducer, on } from '@ngrx/store';


export interface State {
  user: User,
  authError: string,
  loading: boolean
}

const initialState: State = {
  user: null,
  authError: null,
  loading: false
}



export function authReducerAlt(authState: State | undefined, authAction: Action) {
  return createReducer(
    initialState,
    on(AuthActions.loginStart, AuthActions.signupStart, state => ({ ...state, authError: null, loading: true })),
    on(AuthActions.authenticateSuccess, (state, action) => ({ ...state, authError: null, loading: false, user: new User(action.email, action.userId, action.token, action.expirationDate) })),
    on(AuthActions.authenticateFail, (state, action) => ({ ...state, user: null, authError: action.errorMessage, loading: false })),
    on(AuthActions.logout, state => ({ ...state, user: null })),
    on(AuthActions.clearError, state => ({ ...state, authError: null })),
  )(authState, authAction);
}

// export function authReducer(state = initialState, action: AuthActions.AuthActions): State {

//   switch (action.type) {
//     case AuthActions.CLEAR_ERROR:
//       return {
//         ...state,
//         authError: null,
//       }
//     case AuthActions.AUTHENTICATE_SUCCESS:
//       const user = new User(
//         action.payload.email,
//         action.payload.userId,
//         action.payload.token,
//         action.payload.expirationDate
//       );
//       return {
//         ...state,
//         authError: null,
//         user,
//         loading: false
//       }
//     case AuthActions.LOGOUT:
//       return {
//         ...state,
//         user: null
//       }

//     case AuthActions.LOGIN_START:
//     case AuthActions.SIGNUP_START:
//       return {
//         ...state,
//         authError: null,
//         loading: true
//       };
//     case AuthActions.AUTHENTICATE_FAIL:
//       return {
//         ...state,
//         user: null,
//         authError: action.payload,
//         loading: false
//       };
//     default:
//       return state;

//   }
// }
