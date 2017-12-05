import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

const authRoutes: Routes =[
    {path: 'signup', component: SignUpComponent},
    {path: 'signin', component: SignInComponent}
];

@NgModule({
    imports: [RouterModule.forChild(authRoutes)],
    exports: [RouterModule]
})
export class AuthRoutingModule{}