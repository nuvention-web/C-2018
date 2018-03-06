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
  private _transactions: any = [{
    name: `123`,
    amount: `123.00`,
    date: `00-00-00`
  }, {
    name: `123`,
    amount: `123.00`,
    date: `00-00-00`
  }];
  private _flaggedTransactions: any = [];
  private public_token: string;
  private _point: number = 100;
  private _platformSubscriber;
  private _count = 0;


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

}
