import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Push, PushObject, PushOptions, NotificationEventResponse } from '@ionic-native/push';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { NgProgressComponent } from '@ngx-progressbar/core';

import { Notification } from '../../models/notification';
import { Transaction } from '../../models/transaction';
import { PlaidService } from '../../providers/plaid-service/plaid-service';

declare var cordova;

/**
 * Generated class for the DashboardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
})
export class DashboardPage {

  @ViewChild(`totalLast`) totalLast: NgProgressComponent;
  @ViewChild(`exceedLast`) exceedLast: NgProgressComponent;
  @ViewChild(`totalThis`) totalThis: NgProgressComponent;
  @ViewChild(`exceedThis`) exceedThis: NgProgressComponent;

  private notificationCollections: AngularFirestoreCollection<Notification>;
  public _demoText: string = ``;
  private _transactions: any = [
    {
      name: `Today`,
      data: [
        { name: `McDonald's`, amount: `10.74`, date: `2017-02-27`, love: false },
        { name: `Starbucks`, amount: `7.32`, date: `2017-02-27`, love: false },
        { name: `Uber 063015 SF**POOL**`, amount: `5.40`, date: `2017-02-25`, love: false }
      ]
    },
    {
      name: `Yesterday`,
      data: [
        { name: `United Airlines`, amount: `500.00`, date: `2017-02-23`, love: false },
        { name: `AmazonPrime Membersh`, amount: `49.00`, date: `2017-02-23`, love: false }
      ]
    },
    {
      name: `Jan 18`,
      data: [
        { name: `TARGET.COM * 800-591-3869`, amount: `42.49`, date: `2017-02-22`, love: false },
        { name: `AMAZON MKTPLACE`, amount: `27.57`, date: `2017-02-20`, love: false },
        { name: `#03428 JEWEL EVANSTON IL`, amount: `56.20`, date: `2017-02-19`, love: false },
        { name: `Nicor Gas NICPayment 1388019270`, amount: `50.00`, date: `2017-02-16`, love: false },
        { name: `ZARA USA 3697 CHICAGO IL`, amount: `138.21`, date: `2017-02-12`, love: false },
        { name: `B&H PHOTO`, amount: `298.00`, date: `2017-02-08`, love: false },
        { name: `LITTLE TOKYO ROSEMONT`, amount: `11.15`, date: `2017-02-03`, love: false },
        { name: `MICHAEL KORS`, amount: `141.41`, date: `2017-02-08`, love: false },
        { name: `CALVIN KLEIN`, amount: `26.13`, date: `2017-02-06`, love: false },
        { name: `USA*CANTEEN VENDING`, amount: `1.25`, date: `2017-02-03`, love: false },
        { name: `NORRIS CENTER FOOD COUR`, amount: `8.02`, date: `2017-02-02`, love: false },
        { name: `LIBRARY CAFE BERGSON`, amount: `3.85`, date: `2017-02-08`, love: false }
      ]
    }
  ];
  private _flaggedTransactions: any = [];
  private public_token: string;
  private _point: number = 100;
  private _platformSubscriber;
  private _count = 0;


  constructor(
    // private push: Push,
    private firestore: AngularFirestore,
    public navCtrl: NavController,
    public navParams: NavParams,
    private plaidService: PlaidService,
    private zone: NgZone,
    public platform: Platform
  ) {
    this.notificationCollections = this.firestore.collection<Notification>('notifications');
    this.public_token = this.navParams.get(`public_token`);
    // this._demoText = this.public_token;
    // this._transactions = this.plaidService.transactions$;
  }

  ionViewWillEnter() {
    this._platformSubscriber = this.platform.pause.subscribe(() => {
      this.updateTransactions();
    });
  }

  ionViewWillLeave() {
    this._platformSubscriber.unsubscribe();
  }

  ngAfterViewInit() {
    this.totalLast.set(100);
    this.exceedLast.set(40);
    this.totalThis.set(56);
    this.exceedThis.set(20);
  }

  ionViewDidLoad() {
    // this.push.hasPermission().then(
    //   (res: any) => {
    //     if (res.isEnabled) {
    //       console.log('We have permission to send push notifications');
    //     } else {
    //       console.log('We do not have permission to send push notifications');
    //     }
    //   }
    // );

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

    // const pushObject: PushObject = this.push.init(options);

    // pushObject.on('notification').subscribe((notification: NotificationEventResponse) => {
    //   cordova.plugins.notification.local.schedule([
    //     {
    //       id: 1,
    //       title: notification.title,
    //       text: notification.message
    //       // ,actions: [
    //       //   { id: 'yes', title: 'Yes' },
    //       //   { id: 'no', title: 'No' },
    //       //   { id: 'edit', title: 'Edit' }
    //       // ]
    //     }
    //   ]);
    //   // cordova.plugins.notification.local.on('yes', () => {
    //   //   this.demoText = `You clicked Yes!`;
    //   // });
    //   // cordova.plugins.notification.local.on('no', () => {
    //   //   this.demoText = `You clicked No!`;
    //   // });
    //   // cordova.plugins.notification.local.on('edit', () => {
    //   //   this.demoText = `You clicked Edit!`;
    //   // });
    // });
    // pushObject.on('registration').subscribe((registration: any) => console.log('Device registered', registration));
    // pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));

    this.plaidService.transactions$.subscribe(transactions => {
      if (transactions) {
        this.zone.run(() => {
          if (this._count == 0) {
            this._count += 1;
            return;
          }
          this._transactions = transactions;
          this.pushNotification();
          this._count = 0;
        })
      }
    });
  }

  private pushNotification() {
    const newMessage: Notification = {
      message: `Tap to view`,
      title: `Time to check your weekly finance summary!`
    };
    this.notificationCollections.add(newMessage);
  }

  private updateTransactions() {
    this.plaidService.refreshTransaction(this.public_token);
  }

  private onApprove(ev) {
    this._point += ev.point;
    this._transactions.splice(this._transactions.indexOf(ev.transaction), 1);
  }

  private onApproveFlag(ev) {
    this._point += ev.point;
    this._flaggedTransactions.splice(this._flaggedTransactions.indexOf(ev.transaction), 1);
  }

  private onFlag(ev) {
    this._transactions.splice(this._transactions.indexOf(ev.transaction), 1);
    this._flaggedTransactions.unshift(ev.transaction);
  }

  private goToDetail() {
    this.navCtrl.push(`TransDetailPage`);
  }

}
