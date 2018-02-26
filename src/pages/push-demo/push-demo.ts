import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { Push, PushObject, PushOptions, NotificationEventResponse } from '@ionic-native/push';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
// import { Observable } from 'rxjs/Observable';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Notification } from '../../models/notification';

import plaid from 'plaid';

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

  demoText: string = `Waiting for actions`;
  private linkHandler;
  private plaidClient;

  private notificationCollections: AngularFirestoreCollection<Notification>;
  // private notifications: Observable<Notification[]>;

  constructor(
    private push: Push,
    private localNotifications: LocalNotifications,
    private firestore: AngularFirestore,
    private http: HttpClient
  ) {
    this.notificationCollections = this.firestore.collection<Notification>('notifications');
    // this.notifications = this.notificationCollections.valueChanges();
    this.plaidClient = new plaid.Client(
      `5a8c91dc8d9239244b805dec`,              // client id
      `befea17a6a5e505a4e979c3915d746`,        // secret
      `5bd60517b0147259e73119216811f7`,        // public key
      plaid.environments.sandbox               // env
    );
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
      console.log('Received a notification', notification);
      // this.localNotifications.schedule({
      //   id: 1,
      //   text: notification.message,
      //   title: notification.title,
      //   // actions: [
      //   //   { id: 'yes', title: 'Yes' }
      //   // ]
      // });
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
    // this.plaidClient.exchangePublicToken(``, function(err, res) {
    //   const access_token = res.access_token;
    //
    //   this.plaidClient.getAccounts(access_token, function(err, res) {
    //     console.log(res.accounts);
    //   });
    // });

    var self = this;

    this.linkHandler = Plaid.create({
      clientName: 'Plaid Walkthrough Demo',
      env: 'sandbox',
      // Replace with your public_key from the Dashboard
      key: '5bd60517b0147259e73119216811f7',
      product: ['transactions'],
      // Optional, use webhooks to get transaction and error updates
      // webhook: 'https://requestb.in',
      forceIframe: true,
      selectAccount: false,
      onLoad: function() {
        // Optional, called when Link loads
      },
      onSuccess: function(public_token, metadata) {
        // Send the public_token to your app server.
        // The metadata object contains info about the institution the
        // user selected and the account ID, if the Account Select view
        // is enabled.
        // $.post('/get_access_token', {
        //   public_token: public_token,
        // });
        console.log(`public token: ${public_token}`);
        // self.plaidClient.exchangePublicToken(public_token.toString(), function(err, res) {
        //   console.log(`err: ${err}`);
        //   const access_token = res.access_token;
        //   console.log(`access token: ${access_token}`);
        // });
        self.http.post<any>(
          'https://sandbox.plaid.com/item/public_token/exchange',
          JSON.stringify({
            "client_id": "5a8c91dc8d9239244b805dec",
            "secret": "befea17a6a5e505a4e979c3915d746",
            "public_token": public_token
          }),
          {
            headers: {
              'Content-Type': 'application/json'
              // 'Access-Control-Allow-Origin': '*', // 10.105.138.119
              // 'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT, OPTIONS',
              // 'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With',
              // 'Access-Control-Allow-Credentials': 'true'
            }
          }
        ).toPromise().then(res => {
          console.log(`response: ${res}`);
          // self.demoText = res.access_token;
          const access_token = res.access_token;

          self.http.post<any>(
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
                // 'Access-Control-Allow-Origin': '*', // 10.105.138.119
                // 'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT, OPTIONS',
                // 'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With',
                // 'Access-Control-Allow-Credentials': 'true'
              }
            }
          ).toPromise().then(r => {
            const newMessage: Notification = {
              message: `Did you spend $${r.transactions[0].amount} for ${r.transactions[0].name} on ${r.transactions[0].date}?`,
              title: `New Purchase`
            };
            self.notificationCollections.add(newMessage);
          });
        }).catch(err => {
          console.log(`error: ${err.message}`);
          // self.demoText = err.message;
        });
      },
      onExit: function(err, metadata) {
        // The user exited the Link flow.
        if (err != null) {
          // The user encountered a Plaid API error prior to exiting.
        }
        // metadata contains information about the institution
        // that the user selected and the most recent API request IDs.
        // Storing this information can be helpful for support.
      },
      onEvent: function(eventName, metadata) {
        // Optionally capture Link flow events, streamed through
        // this callback as your users connect an Item to Plaid.
        // For example:
        // eventName = "TRANSITION_VIEW"
        // metadata  = {
        //   link_session_id: "123-abc",
        //   mfa_type:        "questions",
        //   timestamp:       "2017-09-14T14:42:19.350Z",
        //   view_name:       "MFA",
        // }
      }
    });
  }

  pushNotification() {
    this.linkHandler.open();

    // const newMessage: Notification = {
    //   message: `Did you buy anything for $7.99?`,
    //   title: `New Purchase`
    // };
    // this.notificationCollections.add(newMessage);
  }

}
