import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { Push, PushObject, PushOptions, NotificationEventResponse } from '@ionic-native/push';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
// import { Observable } from 'rxjs/Observable';

import { Notification } from '../../models/notification';

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

  private notificationCollections: AngularFirestoreCollection<Notification>;
  // private notifications: Observable<Notification[]>;

  constructor(
    private push: Push,
    private localNotifications: LocalNotifications,
    private firestore: AngularFirestore
  ) {
    this.notificationCollections = this.firestore.collection<Notification>('notifications');
    // this.notifications = this.notificationCollections.valueChanges();
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
        senderID: `618786705474`
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
      this.localNotifications.schedule({
        id: 1,
        text: notification.message,
        title: notification.title
      });
    });
    pushObject.on('registration').subscribe((registration: any) => console.log('Device registered', registration));
    pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
  }

  pushNotification() {
    const newMessage: Notification = {
      message: `Test Notification`,
      title: `Test Notification Title`
    };
    this.notificationCollections.add(newMessage);
  }

}
