import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Chart } from 'chart.js';
import * as pattern from 'patternomaly';

/**
 * Generated class for the TransDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-trans-detail',
  templateUrl: 'trans-detail.html',
})
export class TransDetailPage {

  private chart: Chart = [];
  private chartOptions = {
    type: `bar`,
    data: {
      datasets: [{
        data: [450, 250, 200, 100, 110, 250, 650, 430, 570, 120, 120, 640],
        backgroundColor: [
          pattern.draw('dot-dash', '#ff976366'),
          pattern.draw('dot-dash', '#ff976366'),
          pattern.draw('dot-dash', '#ff976366'),
          pattern.draw('dot-dash', '#ff976366'),
          pattern.draw('dot-dash', '#ff976366'),
          pattern.draw('dot-dash', '#ff976366'),
          pattern.draw('dot-dash', '#ff976366'),
          pattern.draw('dot-dash', '#ff976366'),
          pattern.draw('dot-dash', '#ff976366'),
          pattern.draw('dot-dash', '#ff976366'),
          pattern.draw('dot-dash', '#ff976366'),
          pattern.draw('dot-dash', '#ff976366'),
          // pattern.draw('circle', '#36a2eb'),
          // pattern.draw('diamond', '#cc65fe'),
          // pattern.draw('triangle', '#ffce56'),
        ],
        borderColor: [
          'rgba(255, 151, 99,1)',
          'rgba(255, 151, 99,1)',
          'rgba(255, 151, 99,1)',
          'rgba(255, 151, 99,1)',
          'rgba(255, 151, 99,1)',
          'rgba(255, 151, 99,1)',
          'rgba(255, 151, 99,1)',
          'rgba(255, 151, 99,1)',
          'rgba(255, 151, 99,1)',
          'rgba(255, 151, 99,1)',
          'rgba(255, 151, 99,1)',
          'rgba(255, 151, 99,1)',
        ],
        borderWidth: 1
      },
      {
        data: [100, 200, 250, 450, 230, 640, 90, 540, 230, 410, 350, 230],
        backgroundColor: [
          'rgba(17, 178, 69, 0.2)',
          'rgba(17, 178, 69, 0.2)',
          'rgba(17, 178, 69, 0.2)',
          'rgba(17, 178, 69, 0.2)',
          'rgba(17, 178, 69, 0.2)',
          'rgba(17, 178, 69, 0.2)',
          'rgba(17, 178, 69, 0.2)',
          'rgba(17, 178, 69, 0.2)',
          'rgba(17, 178, 69, 0.2)',
          'rgba(17, 178, 69, 0.2)',
          'rgba(17, 178, 69, 0.2)',
          'rgba(17, 178, 69, 0.2)',
        ],
        borderColor: [
          'rgba(17, 178, 69,1)',
          'rgba(17, 178, 69,1)',
          'rgba(17, 178, 69,1)',
          'rgba(17, 178, 69,1)',
          'rgba(17, 178, 69,1)',
          'rgba(17, 178, 69,1)',
          'rgba(17, 178, 69,1)',
          'rgba(17, 178, 69,1)',
          'rgba(17, 178, 69,1)',
          'rgba(17, 178, 69,1)',
          'rgba(17, 178, 69,1)',
          'rgba(17, 178, 69,1)',
        ],
        borderWidth: 1
      }],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      },
      onClick: (evt) => {
        var activePoints = this.chart.getElementsAtEvent(evt);

        if (activePoints.length > 0) {
          // get the internal index of slice in pie chart
          var clickedElementindex = activePoints[0]["_index"];

          // get specific label by index
          var label = this.chart.data.labels[clickedElementindex];

          // get value by index
          var value = this.chart.data.datasets[0].data[clickedElementindex];

          /* other stuff that requires slice's label and value */
          this._month = `${label} 2018`;
        }
      }
    }
  };

  private _transactions: any = [{
    name: `Name`,
    amount: `12.00`,
    date: `18-01-01`
  }, {
    name: `Name`,
    amount: `12.00`,
    date: `18-01-01`
  }, {
    name: `Name`,
    amount: `12.00`,
    date: `18-01-01`
  }, {
    name: `Name`,
    amount: `12.00`,
    date: `18-01-01`
  }];
  private _historyTransactions: any = [{
    name: `Name`,
    amount: `12.00`,
    date: `18-01-01`
  }, {
    name: `Name`,
    amount: `12.00`,
    date: `18-01-01`
  }, {
    name: `Name`,
    amount: `12.00`,
    date: `18-01-01`
  }];

  private _month = `Jan 2018`;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TransDetailPage');

    this.chart = new Chart(`chart-canvas`, this.chartOptions);
  }



}
