import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { CounterModule } from './app/counter/counter.module';



const remoteAppAngular = () => {
  platformBrowserDynamic().bootstrapModule(CounterModule).catch(err => console.log(err))
}


export { remoteAppAngular }
