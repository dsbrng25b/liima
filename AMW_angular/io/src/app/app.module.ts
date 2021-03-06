import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgSelectModule } from '@ng-select/ng-select';
/*
 * Feature Modules
 */
import { ResourceModule } from './resource/resource.module';
import { DeploymentModule } from './deployment/deployment.module';
import { PermissionModule } from './permission/permission.module';
import { AuditviewModule } from './auditview/auditview.module';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { AppRoutingModule } from './app-routing.module';
// App is our top level component
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState, InternalStateType } from './app.service';
import { PageNotFoundComponent } from './not-found.component';



// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    BrowserAnimationsModule,
    NgSelectModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    ResourceModule,
    DeploymentModule,
    AuditviewModule,
    PermissionModule
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
