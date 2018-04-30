import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Chart } from 'chart.js';
import * as pattern from 'patternomaly';
import { UserTransaction } from "../../models/userTransaction";
import { UserAccount } from "../../models/userAccount";
import { PlaidService } from '../../providers/plaid-service/plaid-service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { UserMonthlyRecord } from "../../models/user-monthly-record";

/**
 * Generated class for the TransDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare var Plaid;

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
          console.log("value", value);
          this._monthUnhappy = this.chart.data.datasets[0].data[clickedElementindex];
          console.log("unhappy", this._monthUnhappy);
          this._monthHappy = this.chart.data.datasets[1].data[clickedElementindex];
          console.log("happy", this._monthHappy);
          /* other stuff that requires slice's label and value */
          console.log(document.getElementById("wrap").scroll);
          console.log("clickedElementindex: " + clickedElementindex.toString());
          this.generateNewTransactions(clickedElementindex);
        }
      },
      maintainAspectRatio: false,
      responsive: true
    }
  };




  private _month = ``;
  private _months = {
    "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06",
    "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
  };
  private _montthsNumTOString = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  private _userId: string = this.navParams.get("userId");
  private _public_token: string = "";
  private _access_token: string = this.navParams.get("accessToken");

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private firestore: AngularFirestore,
    private plaidService: PlaidService) {
    this.userMonthlyRecord = this.firestore.collection<UserMonthlyRecord>("user-monthly-amount");
    this.userTransactionCollections = this.firestore.collection<UserTransaction>("user-transactions");
    this.userAccountCollections = this.firestore.collection<UserAccount>("user-accounts");
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad tran-detail");
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
        //console.log("distance: " + distance.toString() + "thisDate: " + thisDate.toDateString() + "databaseDate: " + databaseDate.toDateString());
        if (distance < 12) {
          this.chartOptions.data.datasets[0].data[11 - distance] = t.data().totalAmount - t.data().exceedAmount;
          this.chartOptions.data.datasets[1].data[11 - distance] = t.data().exceedAmount;
          console.log("distance: " + distance.toString() + "happy money: " + this.chartOptions.data.datasets[0].data[11 - distance].toString());
          console.log("distance: " + distance.toString() + "unhappy money: " + this.chartOptions.data.datasets[1].data[11 - distance].toString());
        }
      });
    }).then(() => {
      console.log("happy money begin chart" + this.chartOptions.data.datasets[1].data[11 - 2]);
      this.chart = new Chart(`chart-canvas`, this.chartOptions)
    }
    ).then(() => {
      this.generateNewTransactions(11);
    });
    // this._transactions = this.fakeData;
  }

  private fakeData = [
    {
      name: "name",
      amount: 123,
      loved: false,
      date: "12-34-56"
    }
  ];
  private _transactions: any = [];
  private _partTransactionIds: any = [];

  private updateMonthLabel() {
    console.log("updateMonthLabel");
    var date = new Date();
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
    this._monthUnhappy = this.chart.data.datasets[0].data[clickedElement];
    this._monthHappy = this.chart.data.datasets[1].data[clickedElement];
    var date = new Date();
    date.setMonth(date.getMonth() - (11 - clickedElement));
    var m = date.getMonth();
    var mString = this._montthsNumTOString[m];
    var ySring = date.getFullYear().toString().substr(2, 2);
    this._month = `${mString} ${ySring}`;
    this._transactions = [];
    let partTransactionIds = [];
    let allTransactions = [];
    var allTransactionsMap = new Map();
    let trans = {};


    //得到当月在数据库的transcation id
    var y = date.getFullYear();
    let from = new Date(y, m, 1);
    let to = new Date(y, m + 1, 0);

    console.log("this._access_toke: " + this._access_token.toString());
    console.log("from: " + from.toDateString());
    console.log("to: " + to.toDateString());
    this.plaidService.getTransactionsWithTimeRange(this._access_token, from, to).then(res => {
      res.forEach(t => {
        trans[t["transaction_id"]] = t;
      });
    }).then(() => {
      this.plaidService.getTransactionRecords(this._userId, from, to).then(r => {
        this._transactions.length = 0;
        console.log(r);
        r.forEach(t => {
          let target = trans[t["transactionId"]];
          if (target != null) {
            console.log(`love the item? ${t["loved"]}`);
            target["loved"] = t["loved"];
            this._transactions.push(target);
          }
        });
      });
    });

  }



}
