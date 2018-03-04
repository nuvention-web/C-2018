import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { HttpClient } from '@angular/common/http';

import plaid from 'plaid';
import moment from 'moment/moment';


declare var Plaid;

/**
 * Generated class for the PushDemoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-link-account',
  templateUrl: 'link-account.html',
})
export class LinkAccountPage {

  // linkSuccessfully = false;
  // testData;
  // isRefresh = false;

  // Date: string = "Date";
  // Amount: string = "Amount";
  // Flag: string = "Flag";
  // Approve: string = "Approve";
  // Location: string = "Loation";
  //
  // demoString1: string = "You spend ";
  // demoString2: string = " at ";
  // demoString3: string = " on ";
  //
  // demoDate1: string = "2017-01-01";
  // demoAmount1: string = "$100";
  // demoLocation1: string = "KFC";
  // demoDate2: string = "2017-05-6";
  // demoAmount2: string = "$200";
  // demoLocation2: string = "Wholefoods";

  private linkHandler;
  // public plaidClient;
  // private accessToken;

  constructor(
    private http: HttpClient,
    public navCtrl: NavController
  ) {
    // this.plaidClient = new plaid.Client(
    //   `5a8c91dc8d9239244b805dec`,              // client id
    //   `befea17a6a5e505a4e979c3915d746`,        // secret
    //   `5bd60517b0147259e73119216811f7`,        // public key
    //   plaid.environments.sandbox               // env
    // );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PushDemoPage');


    ///// plaid part

    var config = new LinkConfig(this);

    this.linkHandler = Plaid.create(config);
  }

  linkAccount() {
    this.linkHandler.open();
  }

}

class LinkConfig {
  public publicToken: string;
  private page: LinkAccountPage;
  public clientName = `Centsei`;
  public env = `sandbox`;
  public key = `5bd60517b0147259e73119216811f7`;
  public product = [`transactions`];
  public forceIframe = true;
  public selectAccount = false;

  constructor(page) {
    this.page = page;
  }

  public onLoad() {

  }

  public onSuccess(public_token, metadata) {
    // this.page.updateLinkStatus();
    // console.log("onSuccess 1 : linkSuccessfully is " + this.page.linkSuccessfully);
    this.page.navCtrl.setRoot('DashboardPage', { "public_token": public_token });
    // this.http.post<any>(
    //   'https://sandbox.plaid.com/item/public_token/exchange',
    //   JSON.stringify({
    //     "client_id": "5a8c91dc8d9239244b805dec",
    //     "secret": "befea17a6a5e505a4e979c3915d746",
    //     "public_token": public_token
    //   }),
    //   {
    //     headers: {
    //       'Content-Type': 'application/json'
    //     }
    //   }
    // ).toPromise().then(res => {
    //   // this.accessTokenHandler(res);
    //
    // }).catch(err => {
    //   // console.log("onSuccess 2 : linkSuccessfully is " + this.page.linkSuccessfully);
    //   // console.log(`error: ${err.message}`);
    //   // self.demoText = err.message;
    // });
  }
}
