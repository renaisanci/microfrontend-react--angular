import { Injector, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CounterComponent } from './counter.component';
import { createCustomElement } from '@angular/elements';

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
