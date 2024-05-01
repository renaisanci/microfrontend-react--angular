import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CounterRoutingModule } from './counter-routing.module';
import { CounterComponent } from './counter.component';
import { createCustomElement } from '@angular/elements';
import "zone.js";
import { BrowserModule } from '@angular/platform-browser';



@NgModule({
  declarations: [
    CounterComponent

  ],
  imports: [
    CommonModule,
    CounterRoutingModule,
    BrowserModule
  ],
  exports: [
    CounterComponent

  ]
})
export class CounterModule implements DoBootstrap {

  constructor(private injector: Injector) { }

  ngDoBootstrap() {
    const counterApp = createCustomElement(CounterComponent, { injector: this.injector })
    customElements.define('counter-angular', counterApp)
  }
}
