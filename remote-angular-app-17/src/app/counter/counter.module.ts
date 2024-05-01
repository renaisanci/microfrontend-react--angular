import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CounterRoutingModule } from './counter-routing.module';
import { createCustomElement } from '@angular/elements';
import { CounterComponent } from './counter.component';
import "zone.js";
import { BrowserModule } from '@angular/platform-browser';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CounterRoutingModule,
    BrowserModule
  ]
})
export class CounterModule implements DoBootstrap {

  constructor(private injector: Injector) { }

  ngDoBootstrap() {
    const counterApp = createCustomElement(CounterComponent, { injector: this.injector })
    customElements.define('counter-angular', counterApp)
  }
}
