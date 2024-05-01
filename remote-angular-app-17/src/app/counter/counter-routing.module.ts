import { Injector, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { createCustomElement } from '@angular/elements';
import { CounterComponent } from './counter.component';

const routes: Routes = [
  {
    path: "", //localhost:4200/counter
    component: CounterComponent

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CounterRoutingModule {

 }


