import { Component } from '@angular/core';
import { IonicPage, NavParams, Platform, Events } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

import { User } from '../../models/user';
import { UserAccount } from '../../models/userAccount';
import { PlaidService } from '../../providers/plaid-service/plaid-service';

// import { HttpClient } from '@angular/common/http';
// import { NgProgress } from '@ngx-progressbar/core';
// import plaid from 'plaid';


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
  private environment = `development`;

  private _user: User;
  private userAccountCollections: AngularFirestoreCollection<UserAccount>;

  constructor(
    public platform: Platform,
    public navParams: NavParams,
    private firestore: AngularFirestore,
    private iab: InAppBrowser,
    private events: Events,
    private plaidService: PlaidService
  ) {
    this.userAccountCollections = this.firestore.collection<UserAccount>('user-accounts');
    if (this.navParams.get(`user`)) {
      this._user = this.navParams.get(`user`);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PushDemoPage');
  }

  linkAccount() {
    if (this._user.email == `demo@demo.com`) {
      this.environment = `sandbox`;
    }

    if (this.platform.is('android')) {
      this.linkHandler = Plaid.create({
        clientName: `Coinscious`,
        // env: `sandbox`,
        env: `${this.environment}`,
        key: `28f2e54388e2f6a1aca59e789d353b`,
        product: [`transactions`],
        forceIframe: true,
        selectAccount: false,
        onSuccess: (public_token, metadata) => {
          if (this._user.email == `demo@demo.com`) {
            let newDoc = {} as UserAccount;
            newDoc.userId = this._user.uid;
            newDoc.unflaggedCount = 0;
            this.userAccountCollections.add(newDoc).then(() => {
              // this.checkCredentials();
              this.events.publish(`user:linkStatusChanged`);
            });
            return;
          }
          this.plaidService.getAccessToken(public_token).then(access_token => {
            let newDoc = {} as UserAccount;
            newDoc.publicToken = public_token;
            newDoc.accessToken = access_token;
            newDoc.userId = this._user.uid;
            newDoc.unflaggedCount = 0;
            this.userAccountCollections.add(newDoc).then(() => {
              // this.checkCredentials();
              this.events.publish(`user:linkStatusChanged`);
            });
          });
          // console.log("Login Succeed");
          // this._linkedCredential = true;
        }
      });
      this.linkHandler.open();
      return;
    }

    const linkUrl =
      `https://cdn.plaid.com/link/v2/stable/link.html?` +
      `key=28f2e54388e2f6a1aca59e789d353b` + `&` +
      // `env=sandbox` + `&` +
      `env=${this.environment}` + `&` +
      `clientName=Coinscious` + `&` +
      `product=transactions` + `&` +
      `isMobile=true` + `&` +
      `isWebview=true` + `&` +
      `apiVersion=v2` + `&` +
      `selectAccount=false`;

    const browser = this.iab.create(linkUrl, '_blank', 'location=no,toolbar=no');
    browser.on('loadstop').subscribe(event => {
      console.log(`[InAppBrowser] On Load Stop : ${event.url}`);
    });
    browser.on('loaderror').subscribe(event => {
      console.log(`[InAppBrowser] On Load Error : ${event.url}`);
    });
    browser.on('loadstart').subscribe(event => {
      console.log(`[InAppBrowser] On Load Start: ${event.url}`);
      const redirectUrl = event.url;
      const url = redirectUrl.split(`://`);
      // const protocol = url[0];
      const path = url[1].split(`?`);
      const ev = path[0];

      if (ev == `exit`) browser.close();
      if (ev != `connected`) return;

      // this._isLoading = true;
      browser.close();

      const queryArr = path[1].split(`&`);
      let queries = {};
      queryArr.forEach(q => {
        if (q.indexOf(`=`) < 0) return;
        let query = q.split(`=`);
        queries[query[0]] = query[1];
      });
      console.log(`Get public token! Token: ${queries[`public_token`]}`);

      if (this._user.email == `demo@demo.com`) {
        let newDoc = {} as UserAccount;
        newDoc.userId = this._user.uid;
        newDoc.unflaggedCount = 0;
        this.userAccountCollections.add(newDoc).then(() => {
          // this.checkCredentials();
          this.events.publish(`user:linkStatusChanged`);
        });
        return;
      }

      const public_token = queries[`public_token`];
      this.plaidService.getAccessToken(public_token).then(access_token => {
        console.log(`Get access token! Token: ${access_token}`);
        let newDoc = {} as UserAccount;
        newDoc.publicToken = public_token;
        newDoc.accessToken = access_token;
        newDoc.userId = this._user.uid;
        newDoc.unflaggedCount = 0;
        this.userAccountCollections.add(newDoc).then(() => {
          // this.checkCredentials();
          this.events.publish(`user:linkStatusChanged`);
        });
      });
    });
    // browser.on('loaderror').subscribe(event => {
    //   console.log(`[InAppBrowser] On Load Error: What happened?, ${event.url}`);
    // });
  }

}
