import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, pipe } from 'rxjs';

import { DataStorageService } from '../shared/data-storage.service';
import { AuthService } from '../auth/auth.service';
import { Store } from '@ngrx/store';
import * as fromApp from "../store/app.reducer";
import * as AuthActions from "../auth/store/auth.actions";
import * as RecipesActions from '../recipes/store/recipe.actions';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private userSub: Subscription;

  constructor(
    private dataStorageService: DataStorageService,
    private authService: AuthService,
    private store: Store<fromApp.AppState>
  ) { }

  ngOnInit() {
    this.userSub = this.store.select('auth')
      .pipe(
        map(authState => authState.user)
      )
      .subscribe(user => {
        this.isAuthenticated = !!user;
        console.log(!user);
        console.log(!!user);
      });
  }

  onSaveData() {
    this.dataStorageService.storeRecipes();
  }

  onFetchData() {
    this.store.dispatch(new RecipesActions.FetchRecipes())

    //this.dataStorageService.fetchRecipes().subscribe();
  }

  onLogout() {
    this.store.dispatch(new AuthActions.Logout())
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}
