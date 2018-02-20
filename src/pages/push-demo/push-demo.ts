import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { Push, PushObject, PushOptions, NotificationEventResponse } from '@ionic-native/push';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

import { Notification } from '../../models/notification';
declare var cordova;

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

  private notificationCollections: AngularFirestoreCollection<Notification>;

  constructor(
    private push: Push,
    private firestore: AngularFirestore
  ) {
    this.notificationCollections = this.firestore.collection<Notification>('notifications');
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
  }

  pushNotification() {
    const newMessage: Notification = {
      message: `Did you buy anything for $7.99?`,
      title: `New Purchase`
    };
    this.notificationCollections.add(newMessage);
  }
}
