import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { Chart } from 'chart.js';
import * as pattern from 'patternomaly';
import { UserTransaction } from "../../models/userTransaction";
import { UserAccount } from "../../models/userAccount";
import { PlaidService } from '../../providers/plaid-service/plaid-service';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { UserMonthlyRecord } from "../../models/user-monthly-record";

/**
 * Generated class for the TransDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

// declare var Plaid;
@IonicPage()
@Component({
  selector: 'page-trans-detail',
  templateUrl: 'trans-detail.html',
})
export class TransDetailPage {
  private userTransactionCollections: AngularFirestoreCollection<UserTransaction>;
  private userAccountCollections: AngularFirestoreCollection<UserAccount>;
  private userMonthlyRecord: AngularFirestoreCollection<UserMonthlyRecord>;
  private _monthUnhappy = 0;
  private _monthHappy = 0;
  private chart: Chart = [];
  private _tempMonth = 0;
  private _tempYear = 0;
  private _tempClickElement = 0;
  private _chartVisible = true;
  private chartOptions = {
    type: `bar`,
    data: {
      datasets: [{
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
      labels: ['May', 'J17', 'Ju7', 'Aug 17', 'Sep 17', 'Oct 17', 'Nov 17', 'Dec 17', 'Jan 18', 'Feb 18', 'Mar 18', 'Apr 18']
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
          // get the internal index of slice in pie chart
          var clickedElementindex = activePoints[0]["_index"];
          this.generateNewTransactions(clickedElementindex);
        }
      },
      maintainAspectRatio: false,
      responsive: true
    }


  };




  private _month = ``;

  private _montthsNumTOString = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  private _userId: string = this.navParams.get("userId");
  private _userEmail: string = this.navParams.get("userEmail");
  private _public_token: string = "";
  private _access_token: string = this.navParams.get("accessToken");

  constructor(
    private zone: NgZone,
    public navCtrl: NavController,
    public navParams: NavParams,
    private firestore: AngularFirestore,
    private plaidService: PlaidService,
    private events: Events
  ) {
    this.userMonthlyRecord = this.firestore.collection<UserMonthlyRecord>("user-monthly-amount");
    this.userTransactionCollections = this.firestore.collection<UserTransaction>("user-transactions");
    this.userAccountCollections = this.firestore.collection<UserAccount>("user-accounts");
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad tran-detail 1");
    this.events.publish(`app:pageLoaded`);
    this.updateMonthLabel();
    //得到public token
    this.userAccountCollections.ref.where(`userId`, '==', this._userId).get().then(res => {
      res.forEach(t => {
        this._public_token = t.data().publicToken;
      });
    }, err => {
    });
    //更新chart的数据
    this.userMonthlyRecord.ref.where(`userId`, '==', this._userId).get().then(res => {
      res.forEach(t => {
        let databaseDate = new Date(new Date(t.data().date));
        databaseDate.setHours(24);
        let databaseMonth = databaseDate.getMonth();
        let databaseYear = databaseDate.getFullYear();
        let thisDate = new Date();
        let thisMonth = thisDate.getMonth();
        let thisYear = thisDate.getFullYear();
        let distance = (thisYear - databaseYear) * 12 + (thisMonth - databaseMonth);
        if (distance < 12) {
          this.chartOptions.data.datasets[0].data[11 - distance] = this.round(t.data().exceedAmount);
          this.chartOptions.data.datasets[1].data[11 - distance] = this.round(t.data().totalAmount - t.data().exceedAmount);
        }
      });
    }).then(() => {
      this.chart = new Chart(`chart-canvas`, this.chartOptions);
    }
    ).then(() => {
      console.log("generateNewTransactions 11");
      this.generateNewTransactions(11);
    });
    // this._transactions = this.fakeData;
  }

  // ionViewWillLeave() {
  //   this._chartVisible = false;
  // }

  private _transactions: any = [];
  // private _partTransactionIds: any = [];
  private updateMonthLabel() {
    console.log("updateMonthLabel");
    var tempDate = new Date();
    var date = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1);
    for (var i = 11; i >= 0; i--) {
      var tempM = date.getMonth();
      var m = this._montthsNumTOString[tempM];
      var y = date.getFullYear().toString().substr(2, 2);
      var temp = `${m} ${y}`;
      this.chartOptions.data.labels[i] = temp;
      date.setMonth(date.getMonth() - 1);
    }
  }

  private generateNewTransactions(clickedElement) {
    //更新点击后表显示页的数据
    //console.log("public toke end: " + this._public_token.toString());
    this._tempClickElement = clickedElement;
    var tempMonth = new Date().getMonth() + 1;
    this._tempMonth = tempMonth - (11 - clickedElement);
    this._tempYear = new Date().getFullYear();
    if (this._tempMonth < 0) {
      this._tempYear = this._tempYear - 1;
      this._tempMonth + 12;
    }
    this._monthUnhappy = this.chart.data.datasets[0].data[clickedElement];
    //this._monthUnhappy = 0.11111;
    this._monthUnhappy = Math.round(this._monthUnhappy * 100) / 100;

    this._monthHappy = this.chart.data.datasets[1].data[clickedElement];
    //this._monthHappy = 0.11111;
    this._monthHappy = Math.round(this._monthHappy * 100) / 100;

    var date = new Date();
    date.setMonth(date.getMonth() - (11 - clickedElement));
    var m = date.getMonth();
    var mString = this._montthsNumTOString[m];
    var ySring = date.getFullYear().toString().substr(2, 2);
    this._month = `${mString} ${ySring}`;
    this._transactions = [];

    // let partTransactionIds = [];
    // let allTransactions = [];
    // var allTransactionsMap = new Map();
    let trans = {};


    //得到当月在数据库的transcation id
    var y = date.getFullYear();
    let from = new Date(y, m, 1);
    let to = new Date(y, m + 1, 0);

    // Demo User
    if (this._userEmail == `demo@demo.com`) {
      this.plaidService.getDemoTransactions().then(res => {
        res.forEach(t => {
          trans[t["transaction_id"]] = t;
        });
      }).then(() => {
        this.plaidService.getTransactionRecords(this._userId, from, to).then(r => {
          this._transactions.length = 0;
          console.log(r);
          let result = r.filter(t => t.flagged == true || t.flagged == null);
          result.forEach(t => {
            this.zone.run(() => {
              let target = trans[t["transactionId"]];
              if (target != null) {
                console.log(`love the item? ${t["loved"]}`);
                target["loved"] = t["loved"];
                this._transactions.push(target);
              }
            });
          });
          this.events.publish(`app:archiveTourReady`);
        });
      });
      return;
    }

    this.plaidService.getTransactionsWithTimeRange(this._access_token, from, to).then(res => {
      res.forEach(t => {
        trans[t["transaction_id"]] = t;
      });
    }).then(() => {
      this.plaidService.getTransactionRecords(this._userId, from, to).then(r => {
        this._transactions.length = 0;
        let result = r.filter(t => t.flagged == true || t.flagged == null);
        console.log(r);
        result.forEach(t => {
          this.zone.run(() => {
            let target = trans[t["transactionId"]];
            if (target != null) {
              console.log(`love the item? ${t["loved"]}`);
              target["loved"] = t["loved"];
              this._transactions.push(target);
            }
          });
        });
        this.events.publish(`app:archiveTourReady`);
      });
    });

  }

  abs(x) {
    return Math.abs(x);
  }

  onFlag(ev) {
    if (ev.transaction.loved == false) return;
    console.log("test w: onFlag");
    console.log("test w: monthHappy: " + this._monthHappy.toString() + "  monthunhappy: " + this._monthUnhappy.toString() + "  amount: " + this.abs(ev.transaction.amount).toString());
    this._monthHappy = this._monthHappy - this.abs(ev.transaction.amount);
    this._monthUnhappy = this._monthUnhappy + this.abs(ev.transaction.amount);
    console.log("test w: monthHappy: " + this._monthHappy.toString() + "  monthunhappy: " + this._monthUnhappy.toString() + "  amount: " + this.abs(ev.transaction.amount).toString());
    this.chartOptions.data.datasets[0].data[this._tempClickElement] = this.round(this._monthUnhappy);
    this.chartOptions.data.datasets[1].data[this._tempClickElement] = this.round(this._monthHappy);
    this.chart = new Chart(`chart-canvas`, this.chartOptions);
    ev.transaction.loved = false;
    console.log(ev.transaction.transaction_id.toString());
    this.plaidService.changeLoveToFalse(ev.transaction.transaction_id);
    this.plaidService.chagneMonthAmount(this._userId, this._tempYear, this._tempMonth, this._monthUnhappy);
  }

  onApprove(ev) {
    if (ev.transaction.loved == true) return;
    console.log("test w: onApprove");
    this._monthHappy = this._monthHappy + this.abs(ev.transaction.amount);
    this._monthUnhappy = this._monthUnhappy - this.abs(ev.transaction.amount);
    this.chartOptions.data.datasets[0].data[this._tempClickElement] = this.round(this._monthUnhappy);
    this.chartOptions.data.datasets[1].data[this._tempClickElement] = this.round(this._monthHappy);
    this.chart = new Chart(`chart-canvas`, this.chartOptions);
    ev.transaction.loved = true;
    console.log(ev.transaction.transaction_id.toString());
    this.plaidService.changeLoveToTrue(ev.transaction.transaction_id);
    this.plaidService.chagneMonthAmount(this._userId, this._tempYear, this._tempMonth, this._monthUnhappy);
  }

  round(x) {
    return Math.round(x * 100) / 100;
  }


}
