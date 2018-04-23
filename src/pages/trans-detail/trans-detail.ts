import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Chart } from 'chart.js';
import * as pattern from 'patternomaly';
import {UserTransaction} from "../../models/userTransaction";
import {UserAccount} from "../../models/userAccount";
import { PlaidService } from '../../providers/plaid-service/plaid-service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import {UserMonthlyRecord} from "../../models/user-monthly-record";

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
          console.log("value", value);
          this._monthUnhappy = this.chart.data.datasets[0].data[clickedElementindex];
          console.log("unhappy", this._monthUnhappy);
          this._monthHappy = this.chart.data.datasets[1].data[clickedElementindex];    
          console.log("happy", this._monthHappy);
          /* other stuff that requires slice's label and value */
          console.log(document.getElementById("wrap").scroll);
          this._month = `${label} 2018`;
          this.generateNewTransactions(clickedElementindex);
        }
      }
    }
  };




  private _month = `Jan 2018`;
  private _months = {
    "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06",
    "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
  };

  private _userId: string = this.navParams.get("userId");
  private _public_token: string = "";

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
    //得到public token
    this.userAccountCollections.ref.where(`userId`, '==', this._userId).get().then( res => {
        res.forEach(t => {
            this._public_token = t.data().publicToken;
            //console.log("public toke before: " + this._public_token.toString());
        });
        //console.log("get public token good");
    }, err => {
        //console.log("get public token error");
    });
    //更新chart的数据
    this.userMonthlyRecord.ref.where(`userId`, '==', this._userId).get().then(res => {
      res.forEach(t => {
        let tempDate = new Date(t.data().date);
        let thisMonth = tempDate.getMonth();
        this.chart.data.datasets[0].data[thisMonth] = t.data().totalAmount - t.data().exceedAmount;
        this.chart.data.datasets[1].data[thisMonth] = t.data().exceedAmount;
        //console.log("Happy Amount" + this.chart.data.datasets[0].data[thisMonth].toString());
        //console.log("UnHappy Amount" + this.chart.data.datasets[1].data[thisMonth].toString());
      });
    });
    //console.log("userId is: " + this._userId.toString());
    //console.log("public token then: " + this._public_token.toString());
    this.chart = new Chart(`chart-canvas`, this.chartOptions);
    this.generateNewTransactions(new Date().getMonth());
  }

  private _transactions: any = [];
  private _partTransactionIds: any = [];

  private generateNewTransactions(month) {
      //更新点击后表显示页的数据
      //console.log("public toke end: " + this._public_token.toString());
      this._monthUnhappy = this.chart.data.datasets[0].data[month];
      this._monthHappy = this.chart.data.datasets[1].data[month];
      var label = this.chart.data.labels[month];
      this._month = `${label} 2018`;


      this._transactions = [];
      this._partTransactionIds= [];


      //得到当月在数据库的transcation id
      var date = new Date(), y = date.getFullYear();
      let from = new Date(y, month, 1);
      let to = new Date(y, month + 1, 0);
      this.plaidService.getTransactionRecords(this._userId, from, to).then(res => {
        res.forEach(t => {
          this._partTransactionIds.push(t.transactionId);
          this._transactions.push(t);
        });
      });

      /*
      console.log("from date: " + from.toDateString());
      console.log("to date: " + to.toDateString());
      console.log("partTransactionIds length: " + this._partTransactionIds.length.toString());
      console.log("partTransactionIds 0: " + this._partTransactionIds[0].toString());

      var i = 0;
      this.userTransactionCollections.ref.where(`userId`, '==', this._userId).get().then(res => {
          res.forEach( t => {
              this._partTransactionIds.push(t.data().transactionId);
              console.log("i: " + i.toString() + " t.transcationId: " + t.data().transactionId.toString());
              console.log("partTransactionIds length 2: " + this._partTransactionIds.length.toString());
              i = i + 1;
          });
          console.log("get partTransactions good");
      }, err => {
          console.log("get partTransactions error");
      });
*/
      /*

      this.plaidService.getTransaction2(this._testPublicToken, from, to);
      console.log("transaction length: " + this._transactions.length);
      */
  }



}
