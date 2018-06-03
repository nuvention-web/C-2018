import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {PlaidService} from "../../providers/plaid-service/plaid-service";

/**
 * Generated class for the SummaryDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-summary-detail',
  templateUrl: 'summary-detail.html',
})
export class SummaryDetailPage {

  constructor(
    private plaidService: PlaidService,
    public navCtrl: NavController,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SummaryDetailPage');
    var from = this.navParams.get("from");
    var to = this.navParams.get("to");
    let trans = {};
    var _access_token = this.navParams.get("_access_token");
    var _userId = this.navParams.get("_userId");
    var index = this.navParams.get("index");

    this.plaidService.getTransactionsWithTimeRange(_access_token, from, to).then(res => {
      res.forEach(t => {
        trans[t["transaction_id"]] = t;
      });
    }).then(() => {
      this.plaidService.getTransactionRecords(_userId, from, to).then(r => {
        this._transactions.length = 0;
        let result = r.filter(t => t.flagged == true || t.flagged == null);
        console.log(r);
        result.forEach(t => {
          let target = trans[t["transactionId"]];
          if (target != null) {
            target["loved"] = t["loved"];
            if(target["date"].getDay() == index)
              this._transactions.push(target);
          }
        });
      });
    })
  }

  private _transactions: any = [];


}
