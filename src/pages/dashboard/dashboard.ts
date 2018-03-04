import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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
  public demoText: string = ``;
  transactions: any[];
  private public_token: string;


  constructor(
    private push: Push,
    private firestore: AngularFirestore,
    public navCtrl: NavController,
    public navParams: NavParams,
    private plaidService: PlaidService
  ) {
    this.notificationCollections = this.firestore.collection<Notification>('notifications');
    this.public_token = this.navParams.get(`public_token`);
    this.demoText = this.public_token;
  }

  ngOnInit() {
    this.plaidService.transactions$.subscribe(transactions => {
      // this.demoText = `refreshed, ${transactions}`;
      this.transactions = transactions;

      if (this.transactions != null) {
        const newMessage: Notification = {
          // message: `Did you spend $${transactions[0].amount} for ${transactions[0].name} on ${transactions[0].date}?`,
          message: `Tap to view`,
          title: `Time to check your weekly finance summary!`
        };
        this.notificationCollections.add(newMessage);
      }
    });
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
      // console.log('Received a notification', notification);
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
  }

  updateTransactions() {
    // this.transactions = transactions;
    console.log("Clicked update transactions");

    this.plaidService.refreshTransaction(this.public_token);
  }

  // refreshTransactions(res) {
  //   const access_token = res.access_token;
  // }
  //
  // getAccessToken() {
  // }

}
