import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ActionSheetController, Events } from 'ionic-angular';
import { Chart } from 'chart.js';
import * as pattern from 'patternomaly';
import { UserTransaction } from "../../models/userTransaction";
import { UserAccount } from "../../models/userAccount";
import { PlaidService } from '../../providers/plaid-service/plaid-service';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { UserMonthlyRecord } from "../../models/user-monthly-record";
/**
 * Generated class for the DetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {
  private _chartVisible = true;
  private m = new Map();
  private chart: Chart = [];
  private chart2: Chart = [];
  private chartOptions = {
    type: `bar`,
    data: {
      datasets: [{
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: [
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
          pattern.draw('dot-dash', '#ff9763'),
        ],
        borderColor: [
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
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: [
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
        ],
        borderWidth: 1
      }],
      labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
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
        }],
        xAxes: [{
          ticks: {
            fontSize: 10
          }
        }],
      },
      onClick: (evt) => {
        var activePoints = this.chart.getElementsAtEvent(evt);

        if (activePoints.length > 0) {
          var clickedElementindex = activePoints[0]["_index"];
          //this.clearData();
          this.getData(clickedElementindex);
          this.showDetail = true;
        }
      },
      maintainAspectRatio: false,
      responsive: true
    }
  };
    private chartOptions2 = {
        type: `bar`,
        data: {
            datasets: [{
                data: [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                    pattern.draw('dot-dash', '#ff9763'),
                ],
                borderColor: [
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
                    data: [0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: [
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
                    ],
                    borderWidth: 1
                }],
            labels: ['Food and Drink', 'Restaurants', 'Coffee Shop', 'Chase QuickPay', 'Shops', 'Service', 'Other']
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
                }],
                xAxes: [{
                    ticks: {
                        fontSize: 7
                    }
                }],
            },
            onClick: (evt) => {
                var activePoints = this.chart2.getElementsAtEvent(evt);

                if (activePoints.length > 0) {
                    var clickedElementindex = activePoints[0]["_index"];
                    this.getData(clickedElementindex);
                    this.showDetail2 = true;
                }
            },
            maintainAspectRatio: false,
            responsive: true
        }
    };

  demoItem = { name: `Domino's Pizza`, amount: 37.87, loved: false };
  showDetail = false;
  showDetail2 = false;
  constructor(
    private zone: NgZone,
    public navCtrl: NavController,
    public navParams: NavParams,
    private plaidService: PlaidService,
    private events: Events, ) {
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad DetailPage');
    this.events.publish(`app:pageLoaded`);
    this.m.set('Food and Drink', 0);
    this.m.set('Restaurants', 1);
    this.m.set('Coffee Shop', 2);
    this.m.set('Chase QuickPay', 3);
    this.m.set('Shops', 4);
    this.m.set('Service', 5);

    this.chart = new Chart(`chart-canvas`, this.chartOptions);
    // this.chart.update();
    this.chart2 = new Chart(`chart-canvas-2`, this.chartOptions2);
    // this.chart2.update();
      this.getData(new Date().getDay());
  }

  private _access_token: string = this.navParams.get("accessToken");
  private _userId: string = this.navParams.get("userId");
  private month = new Date().getMonth();
  private year = new Date().getFullYear();
  private _transactions: any = [];
  private _transactions2: any = [];
  private from;
  private to;
  clearData() {
    for (var z3 = 0; z3 < this.chartOptions.data.datasets[0].data.length; z3++) {
      this.chartOptions.data.datasets[0].data[z3] = 0;
      this.chartOptions.data.datasets[1].data[z3] = 0;
      this.chartOptions2.data.datasets[0].data[z3] = 0;
      this.chartOptions2.data.datasets[1].data[z3] = 0;
      console.log(`wen test 133 ${this.chartOptions.data.datasets[0].data[z3]}`);
    }
    this._transactions = [];
    this._transactions2 = [];
  }

  getData(clickedElementindex) {
    let trans = {};
    this.from = new Date(this.year, this.month, 1);
    this.to = new Date(this.year, this.month + 1, 0);
    console.log(`wen test 1: this.to: ${this.to} this.year: ${this.year} this.month: ${this.month}`);
    this.plaidService.getTransactionsWithTimeRange(this._access_token, this.from, this.to).then(res => {
      res.forEach(t => {
        trans[t["transaction_id"]] = t;
      });
      this.clearData();
      this.plaidService.getTransactionRecords(this._userId, this.from, this.to).then(r => {
        this._transactions.length = 0;
        this._transactions2.length = 0;
        let result = r.filter(t => t.flagged == true || t.flagged == null);
        this.clearData();
        result.forEach(t => {
          let target = trans[t["transactionId"]];
          if (target != null) {
            target["loved"] = t["loved"];
            var day = new Date(target["date"]).getDay();
            if (target["loved"] == true) {
              this.chartOptions.data.datasets[1].data[day] += target["amount"];
                for(var z6 = 0; z6 < target["category"].length; z6++) {
                    var temp = 6;
                    if(this.m.has(target["category"][z6]))
                        temp = this.m.get(target["category"][z6]);
                    this.chartOptions2.data.datasets[1].data[temp] += target["amount"];
                    if(temp == clickedElementindex)
                        this._transactions2.push(target);
                }
            }
            else {
              this.chartOptions.data.datasets[0].data[day] += target["amount"];
                for(var z6 = 0; z6 < target["category"].length; z6++) {
                    var temp = 6;
                    if(this.m.has(target["category"][z6]))
                        temp = this.m.get(target["category"][z6]);
                    this.chartOptions2.data.datasets[0].data[temp] += target["amount"];
                    if(temp == clickedElementindex)
                        this._transactions2.push(target);
                }
            }
            if (clickedElementindex == day) {
              this._transactions.push(target);
            }
          }
        });
        this.roundAll();
        this.chart.update();
        this.chart2.update();
      })
    });

  }

  getData2() {
    var clickedElementindex = new Date().getDay();
    this.getData(clickedElementindex);
  }

  round(x) {
    return Math.round(x * 100.0) / 100;
  }

  roundAll() {
    for (var z3 = 0; z3 < this.chartOptions.data.datasets[0].data.length; z3++) {
      this.chartOptions.data.datasets[0].data[z3] = this.round(this.chartOptions.data.datasets[0].data[z3]);
      this.chartOptions.data.datasets[1].data[z3] = this.round(this.chartOptions.data.datasets[1].data[z3]);
      this.chartOptions2.data.datasets[0].data[z3] = this.round(this.chartOptions2.data.datasets[0].data[z3]);
      this.chartOptions2.data.datasets[1].data[z3] = this.round(this.chartOptions2.data.datasets[1].data[z3]);
    }

  }

  closeWindow() {
    this.showDetail = false;
    this.showDetail2 = false;
  }
}
