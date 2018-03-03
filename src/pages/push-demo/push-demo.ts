import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { Push, PushObject, PushOptions, NotificationEventResponse } from '@ionic-native/push';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

import { HttpClient } from '@angular/common/http';

import { Notification } from '../../models/notification';

import plaid from 'plaid';
import moment from 'moment/moment';

declare var cordova;
declare var Plaid;

/**
 * Generated class for the PushDemoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-push-demo',
  templateUrl: 'push-demo.html',
})
export class PushDemoPage {

  demoText: string = ``;
  transactions;
  linkSuccessfully = false;
  testData;
  isRefresh = false;

  Date: string = "Date";
  Amount: string = "Amount";
  Flag: string = "Flag";
  Approve: string = "Approve";
  Location: string ="Loation";

  demoString1: string = "You spend ";
  demoString2: string = " at ";
  demoString3: string = " on ";

  demoDate1: string = "2017-01-01";
  demoAmount1: string = "$100";
  demoLocation1: string = "KFC";
  demoDate2: string = "2017-05-6";
  demoAmount2: string = "$200";
  demoLocation2: string = "Wholefoods";

  private linkHandler;
  // public plaidClient;
  private accessToken;

  private notificationCollections: AngularFirestoreCollection<Notification>;

  constructor(
    private push: Push,
    private firestore: AngularFirestore,
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {
    this.notificationCollections = this.firestore.collection<Notification>('notifications');
    // this.plaidClient = new plaid.Client(
    //   `5a8c91dc8d9239244b805dec`,              // client id
    //   `befea17a6a5e505a4e979c3915d746`,        // secret
    //   `5bd60517b0147259e73119216811f7`,        // public key
    //   plaid.environments.sandbox               // env
    // );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PushDemoPage');
    this.push.hasPermission().then(
      (res: any) => {
        if (res.isEnabled) {
          console.log('We have permission to send push notifications');
        } else {
          console.log('We do not have permission to send push notifications');
        }
      }
    );

    const options: PushOptions = {
      android: {
        senderID: `618786705474`,
        topics: [
          `coincious.general`
        ]
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'false'
      },
      windows: {},
      browser: {
        pushServiceURL: 'http://push.api.phonegap.com/v1/push'
      }
    };

    const pushObject: PushObject = this.push.init(options);

    pushObject.on('notification').subscribe((notification: NotificationEventResponse) => {
      // console.log('Received a notification', notification);
      cordova.plugins.notification.local.schedule([
        {
          id: 1,
          title: notification.title,
          text: notification.message,
          actions: [
            { id: 'yes', title: 'Yes' },
            { id: 'no', title: 'No' },
            { id: 'edit', title: 'Edit' }
          ]
        }
      ]);
      cordova.plugins.notification.local.on('yes', () => {
        this.demoText = `You clicked Yes!`;
      });
      cordova.plugins.notification.local.on('no', () => {
        this.demoText = `You clicked No!`;
      });
      cordova.plugins.notification.local.on('edit', () => {
        this.demoText = `You clicked Edit!`;
      });
    });
    pushObject.on('registration').subscribe((registration: any) => console.log('Device registered', registration));
    pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));


    ///// plaid part

    // var self = this;

    var config = new LinkConfig(this, this.http);

    this.linkHandler = Plaid.create(config);
  }

  updateTransactions(transactions) {
    this.transactions = transactions;

    const newMessage: Notification = {
      message: `Did you spend $${transactions[0].amount} for ${transactions[0].name} on ${transactions[0].date}?`,
      title: `New Purchase`
    };
    this.notificationCollections.add(newMessage);
  }

  pushNotification() {
    this.linkHandler.open();
  }

  updateLinkStatus() {
    this.linkSuccessfully = true;
  }

  clickRefresh() {
    this.isRefresh = true;
  }

}

class LinkConfig {
  public publicToken: string;
  private page: PushDemoPage;
  public clientName = `Coinscious`;
  public env = `sandbox`;
  public key = `5bd60517b0147259e73119216811f7`;
  public product = [`transactions`];
  public forceIframe = true;
  public selectAccount = false;

  constructor(
    page,
    private http: HttpClient) {
    this.page = page;
  }

  public onLoad() {

  }

  public onSuccess(public_token, metadata) {
    this.page.updateLinkStatus();
    console.log("onSuccess 1 : linkSuccessfully is " + this.page.linkSuccessfully);
    this.http.post<any>(
      'https://sandbox.plaid.com/item/public_token/exchange',
      JSON.stringify({
        "client_id": "5a8c91dc8d9239244b805dec",
        "secret": "befea17a6a5e505a4e979c3915d746",
        "public_token": public_token
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).toPromise().then(res => {
      this.accessTokenHandler(res);
    }).catch(err => {
      console.log("onSuccess 2 : linkSuccessfully is " + this.page.linkSuccessfully);
      // console.log(`error: ${err.message}`);
      // self.demoText = err.message;
    });
  }

  accessTokenHandler(res) {
    const access_token = res.access_token;

    this.http.post<any>(
      `https://sandbox.plaid.com/transactions/get`,
      JSON.stringify({
        "client_id": "5a8c91dc8d9239244b805dec",
        "secret": "befea17a6a5e505a4e979c3915d746",
        "access_token": access_token,
        "start_date": "2017-01-01",
        "end_date": "2017-02-01"
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).toPromise().then(r => {
      this.page.updateLinkStatus();
      this.page.updateTransactions(r.transactions);
      console.log("accessTokenHandler 2 : linkSuccessfully is " + this.page.linkSuccessfully);
    });
  }
}
