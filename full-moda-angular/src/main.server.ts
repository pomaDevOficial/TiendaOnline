import { bootstrapApplication } from '@angular/platform-browser';
import { appConfigServer } from './app/app.config.server';
import { AppComponent } from './app/app.component';

const bootstrap = () => bootstrapApplication(AppComponent, appConfigServer);

export default bootstrap;