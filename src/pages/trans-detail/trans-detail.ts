import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Chart } from 'chart.js';
import * as pattern from 'patternomaly';

import { PlaidService } from '../../providers/plaid-service/plaid-service';

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
        data: [500, 480, 460, 380, 400, 370, 340, 320, 290, 270, 250, 260],
        backgroundColor: [
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
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
        data: [600, 720, 700, 760, 720, 780, 800, 830, 850, 800, 920, 950],
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
          this.generateNewTransactions(label);
        }
      }
    }
  };

  private _ts: any = [
    { name: `McDonald's`, amount: `10.74`, date: `2017-02-27`, love: true },
    { name: `Starbucks`, amount: `7.32`, date: `2017-02-27`, love: false },
    { name: `Uber 063015 SF**POOL**`, amount: `5.40`, date: `2017-02-25`, love: true },
    { name: `United Airlines`, amount: `500.00`, date: `2017-02-23`, love: true },
    { name: `AmazonPrime Membersh`, amount: `49.00`, date: `2017-02-23`, love: true },
    { name: `TARGET.COM * 800-591-3869`, amount: `42.49`, date: `2017-02-22`, love: true },
    { name: `AMAZON MKTPLACE`, amount: `27.57`, date: `2017-02-20`, love: true },
    { name: `#03428 JEWEL EVANSTON IL`, amount: `56.20`, date: `2017-02-19`, love: true },
    { name: `Nicor Gas NICPayment 1388019270`, amount: `50.00`, date: `2017-02-16`, love: true },
    { name: `ZARA USA 3697 CHICAGO IL`, amount: `138.21`, date: `2017-02-12`, love: true },
    { name: `B&H PHOTO`, amount: `298.00`, date: `2017-02-08`, love: true },
    { name: `LITTLE TOKYO ROSEMONT`, amount: `11.15`, date: `2017-02-03`, love: true },
    { name: `MICHAEL KORS`, amount: `141.41`, date: `2017-02-08`, love: true },
    { name: `CALVIN KLEIN`, amount: `26.13`, date: `2017-02-06`, love: true },
    { name: `USA*CANTEEN VENDING`, amount: `1.25`, date: `2017-02-03`, love: true },
    { name: `NORRIS CENTER FOOD COUR`, amount: `8.02`, date: `2017-02-02`, love: true },
    { name: `LIBRARY CAFE BERGSON`, amount: `3.85`, date: `2017-02-08`, love: true }
  ];

  private _tSource = [];

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
  private _months = {
    "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06",
    "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private plaidService: PlaidService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TransDetailPage');

    this.chart = new Chart(`chart-canvas`, this.chartOptions);
    this._transactions = this._ts[0];

    this.plaidService.transactions$.subscribe(transactions => {
      this._tSource = transactions;
      this.generateNewTransactions("Jan");
    });
  }

  private generateNewTransactions(month) {
    // const l = this._tSource.length;
    const l = this._ts.length;
    this._transactions = [];
    let numbers = [];
    for (let i = 0; i < 4 + Math.floor((Math.random() * 5)); i++) {
      // let item = this._tSource[Math.floor((Math.random() * l))];
      let num = Math.floor((Math.random() * l));
      let found = numbers.find(n => (n == num));
      if (found) {
        i--;
        continue;
      }
      numbers.push(num);
      let item = this._ts[num];
      item.love = Math.random() > 0.3;
      item.date = `2018-${this._months[month]}-${item.date.substr(8, 2)}`;
      this._transactions.push(item);
    }
    this._transactions.sort((a, b) => (a.date <= b.date));
  }



}
