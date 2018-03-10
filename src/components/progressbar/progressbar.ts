import { Component } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
/**
 * Generated class for the ProgressbarComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'progressbar',
  templateUrl: 'progressbar.html',
})
export class ProgressbarComponent {

  text: string;

  constructor(public progress: NgProgress) {
    console.log('Hello ProgressbarComponent Component');
    this.text = 'Hello World';
    this.progress.start();
  }

}
