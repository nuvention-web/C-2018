import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, LoadingController, ActionSheetController, ToastController } from 'ionic-angular';
import { Push, PushObject, PushOptions, NotificationEventResponse } from '@ionic-native/push';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgProgressComponent } from '@ngx-progressbar/core';

import { Notification } from '../../models/notification';
import { UserAccount } from '../../models/userAccount';
import { User } from '../../models/user';
import { Transaction } from '../../models/transaction';
import { PlaidService } from '../../providers/plaid-service/plaid-service';

declare var cordova;
declare var Plaid;

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
  private userAccountCollections: AngularFirestoreCollection<UserAccount>;
  private userAccount: AngularFirestoreDocument<UserAccount>;
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
  private _linkedCredential = false;
  private _signedIn = false;
  private _user: User;

  private _totalLastV = 1211.66;
  private _exceedLastV = 441.01;
  private _totalThisV = 678.52;
  private _exceedThisV = 220.5;

  private _loading;
  private _isLoading = true;

  private linkHandler;


  constructor(
    // private push: Push,
    private firestore: AngularFirestore,
    public navCtrl: NavController,
    public navParams: NavParams,
    private plaidService: PlaidService,
    private zone: NgZone,
    public platform: Platform,
    private afAuth: AngularFireAuth,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.notificationCollections = this.firestore.collection<Notification>('notifications');
    this.userAccountCollections = this.firestore.collection<UserAccount>('user-accounts');
    this.public_token = this.navParams.get(`public_token`);
    const signedIn = this.navParams.get(`signed_in`);
    const linkedCredential = this.navParams.get(`linked_credential`);
    const needRefresh = this.navParams.get(`need_refresh`);
    this._isLoading = needRefresh == null ? true : needRefresh;
    this._signedIn = signedIn ? true : false;
    this._linkedCredential = linkedCredential ? true : false;
    // console.log(`constructor`);
    // this._demoText = this.public_token;
    // this._transactions = this.plaidService.transactions$;

    if (!this._isLoading) return;

    if (this._linkedCredential) {
      this.userAccount = this.firestore.doc<UserAccount>(`user-accounts/${this.navParams.get(`user_doc_id`)}`);
      this._isLoading = false;
      return;
    }

    if (this._signedIn) {
      console.log(`check auth state`);
      this.afAuth.authState.subscribe(data => {
        this._user = new User(data);
        this.userAccountCollections.ref.where(`userId`, '==', this._user.uid).get().then(res => {
          res.forEach(doc => {
            this.navCtrl.setRoot(
              'DashboardPage',
              {
                public_token: doc.data().accountToken,
                user_doc_id: doc.id,
                signed_in: true,
                linked_credential: true,
                need_refresh: true
              });
          });
          console.log(`change root`);
        }, err => {

        });
      });
      return;
    }

    this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        // user logged in
        console.log("logged in");
        this.navCtrl.setRoot(
          `DashboardPage`,
          {
            signed_in: true,
            linked_credential: false,
            need_refresh: true
          });
      } else {
        // user logged out
        console.log("logged out");
        this.navCtrl.setRoot(`LoginPage`);
      }
    });
  }

  ionViewWillEnter() {
  }

  ionViewWillLeave() {
    // this._platformSubscriber.unsubscribe();
  }

  ngAfterViewInit() {
    if (!this._isLoading)
      this.calculateBar();
  }

  ionViewDidEnter() {
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

    // this.plaidService.transactions$.subscribe(transactions => {
    //   if (transactions) {
    //     this.zone.run(() => {
    //       if (this._count == 0) {
    //         this._count += 1;
    //         return;
    //       }
    //       this._transactions = transactions;
    //       this.pushNotification();
    //       this._count = 0;
    //     });
    //   }
    // });


    ///// plaid part

    if (this._signedIn && !this._linkedCredential) {
      this.linkHandler = Plaid.create({
        clientName: `Coinscious`,
        env: `sandbox`,
        key: `28f2e54388e2f6a1aca59e789d353b`,
        product: [`transactions`],
        forceIframe: true,
        selectAccount: false,
        onSuccess: (public_token, metadata) => {
          let newDoc = {} as UserAccount;
          newDoc.accountToken = public_token;
          newDoc.userId = this._user.uid;
          this.userAccountCollections.add(newDoc).then(() => {
            // this.loadingCtrl.create({
            //   content: 'Please wait...'
            // }).present();
            this.navCtrl.setRoot(
              'DashboardPage',
              {
                public_token: public_token,
                signed_in: true,
                linked_credential: true,
                need_refresh: true
              });
          });
          // console.log("Login Succeed");
          // this._linkedCredential = true;
        }
      });
    }
  }

  private calculateBar() {
    if (!this._signedIn || !this._linkedCredential) return;

    const total = this._totalThisV > this._totalLastV ? this._totalThisV : this._totalLastV;
    this.totalLast.set(this._totalLastV / total * 100);
    this.totalThis.set(this._totalThisV / total * 100);
    this.exceedLast.set(this._exceedLastV / total * 100);
    this.exceedThis.set(this._exceedThisV / total * 100);
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
    ev.group.data.forEach(t => {
      this._totalThisV += Number(t.amount);
    });
    // ev.group = [];
    console.log(ev.group);
    this._transactions.splice(this._transactions.indexOf(ev.group), 1);
    this.calculateBar();
  }

  private onApproveFlag(ev) {
    this._point += ev.point;
    this._flaggedTransactions.splice(this._flaggedTransactions.indexOf(ev.transaction), 1);
  }

  private onFlag(ev) {
    ev.group.data.splice(ev.index, 1);
    this._totalThisV += Number(ev.transaction.amount);
    this._exceedThisV += Number(ev.transaction.amount);
    // this._flaggedTransactions.unshift(ev.transaction);
    if (ev.group.data.length == 0) {
      this._transactions.splice(this._transactions.indexOf(ev.group), 1);
    }
    this.calculateBar();
  }

  private goToDetail() {
    this.navCtrl.push(`TransDetailPage`);
  }

  private linkAccount() {
    this.linkHandler.open();
  }

  private signOut() {
    this.afAuth.auth.signOut().then(() => {
      this.navCtrl.setRoot(`LoginPage`);
    });
  }

  private showMenuActions() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Unbind Account?',
      buttons: [
        {
          text: 'Unbind',
          role: 'unbind',
          handler: () => {
            // console.log('Destructive clicked');
            this.userAccount.delete().then(() => {
              this.navCtrl.setRoot('DashboardPage', { signed_in: true, linked_credential: false });
            });
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

}
