import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ActionSheetController, Events } from 'ionic-angular';
import { Chart } from 'chart.js';
import * as pattern from 'patternomaly';
import { UserTransaction } from "../../models/userTransaction";
import { Transaction } from "../../models/Transaction";
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
  private chart: Chart = null;
  private chart2: Chart = null;
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
        var activePoints = this.chart.getElementAtEvent(evt);

        if (activePoints.length > 0) {
          var clickedElementindex = activePoints[0]["_index"];
          //this.clearData();
          // this.getData(clickedElementindex);
          this.applyFilter(0, clickedElementindex, activePoints[0]["_datasetIndex"] != 0);
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
        var activePoints = this.chart2.getElementAtEvent(evt);

        if (activePoints.length > 0) {
          var clickedElementindex = activePoints[0]["_index"];
          // this.getData(clickedElementindex);
          this.applyFilter(1, clickedElementindex, activePoints[0]["_datasetIndex"] != 0);
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

    // this.chart = new Chart(`chart-canvas`, this.chartOptions);
    // this.chart.update();
    // this.chart2 = new Chart(`chart-canvas-2`, this.chartOptions2);
    // this.chart2.update();
    this.getData();
  }

  private _access_token: string = this.navParams.get("accessToken");
  private _userId: string = this.navParams.get("userId");
  private _email: string = this.navParams.get("email");
  private month = new Date().getMonth();
  private year = new Date().getFullYear();
  private _transactions: any = [];
  private _transactions2: any = [];
  private trans: Transaction[] = [];
  private records: UserTransaction[] = [];
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

  getData() {
    this.from = new Date(this.year, this.month, 1);
    this.to = new Date(this.year, this.month + 1, 0);
    console.log(`wen test 1: this.to: ${this.to} this.year: ${this.year} this.month: ${this.month}`);
    if (this._email == `demo@demo.com`) {
      this.plaidService.getDemoTransactions().then(res => this.processData(res));
      return;
    }

    this.plaidService.getTransactionsWithTimeRange(this._access_token, this.from, this.to).then(
      res => this.processData(res)
    );

  }

  processData(res) {
    let trans = {};

    res.forEach(t => {
      trans[t["transaction_id"]] = t;
    });
    this.trans = res;
    console.log(`[Summary] Got transactions`);
    console.log(this.trans);
    console.log(trans);
    this.clearData();
    this.plaidService.getTransactionRecords(this._userId, this.from, this.to).then(r => {
      this._transactions.length = 0;
      this._transactions2.length = 0;
      let result = r.filter(t => t.flagged == true);
      this.records = result;
      console.log(`[Summary] Got records`);
      console.log(this.records);
      this.clearData();
      result.forEach(t => {
        let target = trans[t["transactionId"]];
        if (target != null) {
          target["loved"] = t["loved"];
          var day = new Date(target["date"]).getDay();
          if (target["loved"] == true) {
            this.chartOptions.data.datasets[1].data[day] += target["amount"];
            for (let z6 = 0; z6 < target["category"].length; z6++) {
              let temp = 6;
              if (this.m.has(target["category"][z6]))
                temp = this.m.get(target["category"][z6]);
              this.chartOptions2.data.datasets[1].data[temp] += target["amount"];
              // if (temp == clickedElementindex)
              //   this._transactions2.push(target);
            }
          }
          else {
            this.chartOptions.data.datasets[0].data[day] += target["amount"];
            for (let z6 = 0; z6 < target["category"].length; z6++) {
              let temp = 6;
              if (this.m.has(target["category"][z6]))
                temp = this.m.get(target["category"][z6]);
              this.chartOptions2.data.datasets[0].data[temp] += target["amount"];
              // if (temp == clickedElementindex)
              //   this._transactions2.push(target);
            }
          }
          // if (clickedElementindex == day) {
          // this._transactions.push(target);
          // }
        }
      });
      this.roundAll();

      if (this.chart == null) this.chart = new Chart(`chart-canvas`, this.chartOptions);
      if (this.chart2 == null) this.chart2 = new Chart(`chart-canvas-2`, this.chartOptions2);
      this.chart.update();
      this.chart2.update();
      console.log(`[Summary] Refreshed`);
    })
  }

  getData2() {
    var clickedElementindex = new Date().getDay();
    this.getData();
  }

  applyFilter(chartIndex, index, isGoodPurchase) {
    let result = [];

    console.log(`[Summary Filter] applying filter, ${chartIndex}, ${index}, ${isGoodPurchase}`)

    switch (chartIndex) {
      case 0:
        result = this.trans.filter((t: Transaction) => {
          let day = new Date(t.date).getDay();
          let tr = this.records.find((r: UserTransaction) => r.transactionId == t.transaction_id);
          let loved = tr == null ? false : tr.loved;
          return tr != null && day == index && loved == isGoodPurchase;
        });
        break;
      case 1:
        result = this.trans.filter((t: Transaction) => {
          let tr = this.records.find((r: UserTransaction) => r.transactionId == t.transaction_id);
          let loved = tr == null ? false : tr.loved;
          let haveTargetCat = t.category.some(c => this.m.has(c) && this.m.get(c) == index);
          if (!haveTargetCat) haveTargetCat = index == 6;
          return tr != null && loved == isGoodPurchase && haveTargetCat;
        });
        break;
    }
    console.log(`[Summary Filter]`, result);
    console.log(`[Summary Filter] End`);

    this._transactions = result;
    this._transactions2 = result;
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
