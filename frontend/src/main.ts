import 'zone.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { provideZoneChangeDetection } from '@angular/core';

import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';

import { App } from './app/app';

import { routes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [provideZoneChangeDetection(), provideRouter(routes), provideHttpClient()],
}).catch((err) => console.error(err));
