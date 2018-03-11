import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Push, PushObject, PushOptions, NotificationEventResponse } from '@ionic-native/push';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

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

  private notificationCollections: AngularFirestoreCollection<Notification>;
  public _demoText: string = ``;
  private _transactions: any = [];
  private _transactions1: any = [];
  private _transactions2: any = [];
  private _flaggedTransactions: any = [];
  private public_token: string;
  private _point: number = 100;
  private _platformSubscriber;
  private _count = 0;
  private _thisMonthNotApproveSum = 0; 
  private _lastMonthNotApproveSum = 0;




  private _thisMonthSum = 0;
  private _lastMonthSum = 0;
  private _thisMonthApproveSum = 0;
  private _lastMonthApproveSum = 0;

  private _time_1: string = "Mar. 9";
  private _transaction_11_appear = true;
  private _transaction_12_appear = true;
  private _transaction_13_appear = true;
  private _transaction_11_name: string = "KFC";
  private _transaction_12_name: string = "Uber";
  private _transaction_13_name: string = "Tech Express";
  private _transaction_11_amount = 7.9;
  private _transaction_12_amount = 4.5;
  private _transaction_13_amount = 8.3;

  private _time_2: string = "Mar. 5";
  private _transaction_21_appear = true;
  private _transaction_22_appear = true;
  private _transaction_23_appear = true;
  private _transaction_21_name: string = "Lyft";
  private _transaction_22_name: string = "Amazon";
  private _transaction_23_name: string = "Whole foods";
  private _transaction_21_amount = 3.7;
  private _transaction_22_amount = 45.6;
  private _transaction_23_amount = 15.5;

  private _time_3: string = "Mar. 1";
  private _transaction_31_appear = true;
  private _transaction_32_appear = true;
  private _transaction_33_appear = true;
  private _transaction_31_name: string = "KFC";
  private _transaction_32_name: string = "Apple store";
  private _transaction_33_name: string = "Whole foods";
  private _transaction_31_amount = 5.6;
  private _transaction_32_amount = 10;
  private _transaction_33_amount = 13.3;


  constructor(
    private push: Push,
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

  ionViewDidLoad() {
    this._thisMonthSum += this._transaction_11_amount;
    this._thisMonthSum += this._transaction_12_amount;
    this._thisMonthSum += this._transaction_13_amount;
    this._thisMonthSum += this._transaction_21_amount;
    this._thisMonthSum += this._transaction_22_amount;
    this._thisMonthSum += this._transaction_23_amount;
    this._thisMonthSum += this._transaction_31_amount;
    this._thisMonthSum += this._transaction_32_amount;
    this._thisMonthSum += this._transaction_33_amount;

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
      cordova.plugins.notification.local.schedule([
        {
          id: 1,
          title: notification.title,
          text: notification.message
          // ,actions: [
          //   { id: 'yes', title: 'Yes' },
          //   { id: 'no', title: 'No' },
          //   { id: 'edit', title: 'Edit' }
          // ]
        }
      ]);
      // cordova.plugins.notification.local.on('yes', () => {
      //   this.demoText = `You clicked Yes!`;
      // });
      // cordova.plugins.notification.local.on('no', () => {
      //   this.demoText = `You clicked No!`;
      // });
      // cordova.plugins.notification.local.on('edit', () => {
      //   this.demoText = `You clicked Edit!`;
      // });
    });
    pushObject.on('registration').subscribe((registration: any) => console.log('Device registered', registration));
    pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));

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

  private refreshLastMonth() {
    this._lastMonthSum = 0;
    this.plaidService.refreshLastMonthTransaction(this.public_token);
    this._transactions2 = this._transactions;
    for(var i = 0; i < this._transactions2.length; i++) {
      this._lastMonthSum += this._transactions2[i].amount;
    }
    this._lastMonthApproveSum = 500;
    this._lastMonthNotApproveSum = this._lastMonthSum - this._lastMonthApproveSum;
  }

  private refreshThisMonth() {
    this._thisMonthSum = 0;
    this._thisMonthApproveSum = 0;
    this.plaidService.refreshThisMonthTransaction(this.public_token);
    this._transactions1 = this._transactions;
    for(var i = 0; i < this._transactions1.length; i++) {
      this._thisMonthSum += this._transactions1[i].amount;
    }
    this._thisMonthNotApproveSum = 0;
  }
/*
  private refreshThisMonthApproveSum() {
    this._thisMonthApproveSum = 0;
    for(var i = 0; i < this._flaggedTransactions.length; i++) {
      this._thisMonthApproveSum += this._transactions[i].amount;
    }
    this._thisMonthNotApproveSum = this._thisMonthSum - this._thisMonthApproveSum;
  }
*/
  private onApprove(ev) {
    this._point += ev.point;
    this._transactions.splice(this._transactions.indexOf(ev.transaction), 1);
  }

  private onApproveFlag(ev) {
    this._point += ev.point;
    this._flaggedTransactions.splice(this._flaggedTransactions.indexOf(ev.transaction), 1);
  }

  private onFlag(ev) {
    this._transactions1.splice(this._transactions1.indexOf(ev.transaction), 1);
    this._transactions2.unshift(ev.transaction);
    this._thisMonthNotApproveSum += ev.transaction.amount;
  }

  private allAprove() {

    for(var i = 0; i < this._transactions1.length; i++) {
      this._transactions2.unshift(this._transactions1[i]);
      this._thisMonthApproveSum += this._transactions1[i].amount;
    }
    this._transactions1.splice(0, this._transactions1.length);
  }

  /*
  private onNotFlag(ev) {
    this._flaggedTransactions.splice(this._flaggedTransactions.indexOf(ev.transaction), 1);
    this._transactions.unshift(ev.transaction);
  }
  */

  private goToDetail() {
    this.navCtrl.push(`TransDetailPage`);
  }


  private approve1() {
    if(this._transaction_11_appear)
      this._thisMonthApproveSum += this._transaction_12_amount;
    if(this._transaction_12_appear)
      this._thisMonthApproveSum += this._transaction_12_amount;
    if(this._transaction_13_appear)
      this._thisMonthApproveSum += this._transaction_13_amount;
    this._transaction_11_appear = false;
    this._transaction_12_appear = false;
    this._transaction_13_appear = false;
  }

  private notApprove11() {
    this._transaction_11_appear = false;
  }

  private notApprove12() {
    this._transaction_12_appear = false;
  }

  private notApprove13() {
    this._transaction_13_appear = false;
  }

   private approve2() {
    if(this._transaction_21_appear)
      this._thisMonthApproveSum += this._transaction_22_amount;
    if(this._transaction_22_appear)
      this._thisMonthApproveSum += this._transaction_22_amount;
    if(this._transaction_23_appear)
      this._thisMonthApproveSum += this._transaction_23_amount;
    this._transaction_21_appear = false;
    this._transaction_22_appear = false;
    this._transaction_23_appear = false;
    console.log(this._thisMonthSum);
    console.log(this._thisMonthApproveSum);
  }

  private notApprove21() {
    this._transaction_21_appear = false;
  }

  private notApprove22() {
    this._transaction_22_appear = false;
  }

  private notApprove23() {
    this._transaction_23_appear = false;
  }

}
