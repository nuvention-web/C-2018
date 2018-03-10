import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { HttpClient } from '@angular/common/http';
import { NgProgress } from '@ngx-progressbar/core';
import plaid from 'plaid';


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

  private linkHandler;

  constructor(
    private http: HttpClient,
    public navCtrl: NavController
  ) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PushDemoPage');


    ///// plaid part

    this.linkHandler = Plaid.create({
      clientName: `Centsei`,
      env: `sandbox`,
      key: `5bd60517b0147259e73119216811f7`,
      product: [`transactions`],
      forceIframe: true,
      selectAccount: false,
      onSuccess: (public_token, metadata) => {
        this.navCtrl.setRoot('DashboardPage', { "public_token": public_token });
      }
    });
  }

  linkAccount() {
    this.linkHandler.open();
  }

}
