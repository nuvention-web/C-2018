import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ActionSheetController } from 'ionic-angular';
import { MenuController } from 'ionic-angular';
// import { PushObject, PushOptions, NotificationEventResponse } from '@ionic-native/push';
// import { Push } from '@ionic-native/push';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgProgressComponent } from '@ngx-progressbar/core';
// import { Observable } from "rxjs/Observable";
import { ISubscription } from "rxjs/Subscription";

import { Notification } from '../../models/notification';
import { UserAccount } from '../../models/userAccount';
import { User } from '../../models/user';
import { Transaction } from '../../models/transaction';
import { UserTransaction } from '../../models/userTransaction';
import { PlaidService } from '../../providers/plaid-service/plaid-service';

// declare var cordova;
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
  @ViewChild(`totalLastBelow`) totalLastBelow: NgProgressComponent;
  @ViewChild(`totalThisBelow`) totalThisBelow: NgProgressComponent;

  private notificationCollections: AngularFirestoreCollection<Notification>;
  private userAccountCollections: AngularFirestoreCollection<UserAccount>;
  private userAccount: AngularFirestoreDocument<UserAccount>;
  private _uaSubscription: ISubscription;
  private _userAccount: UserAccount;
  public _demoText: string = `No message.`;
  private months = [`Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`];
  private _transactions: any = [];
  private _transHistory: UserTransaction[] = null;
  private _flaggedTransactions: any = [];
  // private public_token: string;
  private _point: number = 100;
  // private _platformSubscriber;
  // private _count = 0;
  private _linkedCredential = false;
  private _signedIn = false;
  private _user: User;
  public emptyTransactions = true;

  private _totalLastV = 0.00;
  private _exceedLastV = 0.00;
  private _totalThisV = 0.00;
  private _exceedThisV = 0.00;
  private _spendingMoreThis = false;
  private _spendingMoreLast = false;

  private _isLoading = true;

  private linkHandler;
  private environment = `development`;

  private fakeData = [
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
      name: `2 days ago`,
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

  private fakeTrans = [
    { name: `TARGET.COM * 800-591-3869`, amount: 42.49, date: `2017-02-22`, love: false },
    { name: `AMAZON MKTPLACE`, amount: 27.57, date: `2017-02-20`, love: false },
    { name: `#03428 JEWEL EVANSTON IL`, amount: 56.20, date: `2017-02-19`, love: false },
    { name: `Nicor Gas NICPayment 1388019270`, amount: 50.00, date: `2017-02-16`, love: false },
    { name: `ZARA USA 3697 CHICAGO IL`, amount: 138.21, date: `2017-02-12`, love: false },
    { name: `B&H PHOTO`, amount: 298.00, date: `2017-02-08`, love: false },
    { name: `LITTLE TOKYO ROSEMONT`, amount: 11.15, date: `2017-02-03`, love: false },
    { name: `MICHAEL KORS`, amount: 141.41, date: `2017-02-08`, love: false },
    { name: `CALVIN KLEIN`, amount: 26.13, date: `2017-02-06`, love: false },
    { name: `USA*CANTEEN VENDING`, amount: 1.25, date: `2017-02-03`, love: false },
    { name: `NORRIS CENTER FOOD COUR`, amount: 8.02, date: `2017-02-02`, love: false },
    { name: `LIBRARY CAFE BERGSON`, amount: 3.85, date: `2017-02-08`, love: false },
    { name: `United Airlines`, amount: 500.00, date: `2017-02-23`, love: false },
    { name: `AmazonPrime Membersh`, amount: 49.00, date: `2017-02-23`, love: false },
    { name: `McDonald's`, amount: 10.74, date: `2017-02-27`, love: false },
    { name: `Starbucks`, amount: 7.32, date: `2017-02-27`, love: false },
    { name: `Uber 063015 SF**POOL**`, amount: 5.40, date: `2017-02-25`, love: false }
  ];


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
    private menuCtrl: MenuController,
    // private loadingCtrl: LoadingController,
    // private toastCtrl: ToastController,
    private iab: InAppBrowser
  ) {
    this.notificationCollections = this.firestore.collection<Notification>('notifications');
    this.userAccountCollections = this.firestore.collection<UserAccount>('user-accounts');

    this.checkAuthState();
  }

  ionViewWillEnter() {
  }

  ionViewWillLeave() {
    // this._platformSubscriber.unsubscribe();
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

    // const options: PushOptions = {
    //   android: {
    //     senderID: `618786705474`,
    //     topics: [
    //       `coincious.general`
    //     ]
    //   },
    //   ios: {
    //     alert: 'true',
    //     badge: true,
    //     sound: 'false'
    //   },
    //   windows: {},
    //   browser: {
    //     pushServiceURL: 'http://push.api.phonegap.com/v1/push'
    //   }
    // };

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
    //     console.log(`New Transactions arrived`);
    //     console.log(transactions);
    //     this.reshapeTransactions(transactions);
    //   }
    // }, err => {
    //   console.log(`New Transaction Error: ${err.message}`);
    //   this._demoText = `${err.message}`
    // });

    this.plaidService.lastMonthlyAmounts$.subscribe(record => {
      console.log(`[Monthly Record] Got last month record.`);
      console.log(record);
      // this.zone.run(() => {
      // });
      if (record != null) {
        this._totalLastV = record.totalAmount;
        this._exceedLastV = record.exceedAmount;
      }
      this.calculateBar();
    });

    this.plaidService.thisMonthlyAmounts$.subscribe(record => {
      console.log(`[Monthly Record] Got this month record.`);
      console.log(record);
      // this.zone.run(() => {
      // });
      if (record != null) {
        this._totalThisV = record.totalAmount;
        this._exceedThisV = record.exceedAmount;
      }
      this.calculateBar();
    });

    this.plaidService.testString$.subscribe(s => {
      this.zone.run(() => {
        this._demoText = s;
      });
    });

    // this._transactions = this.fakeData;
    // this.emptyTransactions = false;
  }

  private checkAuthState() {
    this._isLoading = true;
    this._signedIn = false;
    this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        // user logged in
        console.log("logged in");

        this._linkedCredential = false;
        this._signedIn = true;
        this.checkCredentials();
      } else {
        // user logged out
        console.log("logged out");
        this.navCtrl.setRoot(`LoginPage`);
      }
    });
  }

  private checkCredentials() {
    this._isLoading = true;
    this.afAuth.authState.subscribe(data => {
      this._linkedCredential = false;
      this._user = new User(data);

      this.userAccountCollections.ref.where(`userId`, '==', this._user.uid).get().then(res => {
        if (!res.empty) {
          console.log(`found credential`);
          this._isLoading = false;
          this._linkedCredential = true;
          this.getUserInfo(res.docs[0].id);
          // this._userAccount = res[0].data();
          // this.userAccount = this.firestore.doc<UserAccount>(`user-accounts/${res[0].id}`);
        } else {
          this._isLoading = false;
          this._linkedCredential = false;
        }
      }, err => {
        console.log(`error`);
        this._isLoading = false;
        this._linkedCredential = false;
      });
    });
  }

  private getUserInfo(userId) {
    this.userAccount = this.firestore.doc<UserAccount>(`user-accounts/${userId}`);

    this._uaSubscription = this.userAccount.valueChanges().subscribe(ua => {
      console.log(`received user account`);
      console.log(ua);
      this._userAccount = ua;
      this._uaSubscription.unsubscribe();

      this._isLoading = false;
      // this.calculateBar();

      // Demo process for demo@demo.com

      if (this._user.email == `demo@demo.com`) {
        this._isLoading = false;
        this._linkedCredential = true;
        this.emptyTransactions = false;
        this.refreshDemoTransactions();
        this.plaidService.getMonthlyAmount(this._user.uid);
        return;
      }

      // get transaction data we have
      let to = new Date();
      let from = new Date(to.getTime() - 1000 * 60 * 60 * 24 * 10);

      // TODO

      this.plaidService.refreshTransaction(ua.accessToken).then(
        res => {
          this.plaidService.getTransactionRecords(ua.userId, from, to)
            .then(transactions => {
              // this._demoText = `Received Transaction Records`;
              console.log(`Received Transaction Records`);
              // console.log(transactions);
              this._transHistory = transactions;
              console.log(`plaid transactions`);
              // console.log(res);
              this.reshapeTransactions(res);
              this.userAccount.update({ lastSignIn: to });
            }).catch(err => {
              // this._demoText = err.message;
              console.log(`Error Receiving Transaction Records, ${err.message}`);
            });
        }
      ).catch();

      this.plaidService.getMonthlyAmount(ua.userId);
    });
    // this.plaidService.refreshTransaction(this.userAccount.);
    // this._isLoading = false;
  }

  private refreshDemoTransactions() {
    let trans = [
      { name: "Today", data: [] },
      { name: "Yesterday", data: [] },
      { name: "2 Days Ago", data: [] }];
    let date = new Date();
    let dateCounter = 0;
    trans.forEach(t => {
      let count = this.getRandomInt(this.fakeTrans.length);

      let thisMonthNum = date.getMonth() + 1;
      const thisDateNum = date.getDate();
      const thisMonthStr = thisMonthNum >= 10 ? `${thisMonthNum}` : `0${thisMonthNum}`;
      const thisDateStr = thisDateNum >= 10 ? `${thisDateNum}` : `0${thisDateNum}`;
      const dateStr = `${date.getFullYear()}-${thisMonthStr}-${thisDateStr}`;

      for (let i = 0; i < count; i++) {
        let index = this.getRandomInt(this.fakeTrans.length);
        let newTran = JSON.parse(JSON.stringify(this.fakeTrans[index]));
        newTran.date = dateStr;
        newTran.transaction_id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
        t.data.push(newTran);
      }

      dateCounter++;
      date = new Date(date.getTime() - 1000 * 60 * 60 * dateCounter);
    });

    console.log(trans[0].data[0]);

    this._transactions = trans;
  }

  private reshapeTransactions(transactions) {
    if (this._transHistory == null || transactions == null) return;
    console.log(`Calculating Transactions`);
    console.log(transactions);

    transactions.sort((a, b) => {
      return a.date > b.date ? -1 : 1;
    });
    transactions = transactions.filter(t => !this._transHistory.some(tr => tr.transactionId == t.transaction_id));
    transactions = transactions.filter(t => t.amount > 0);
    console.log(transactions);

    const today = new Date();
    const yesterday = new Date(today.getTime() - 1000 * 60 * 60 * 24);
    // const dbeforey = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 2);

    let trans = [
      { name: "Today", data: [] },
      { name: "Yesterday", data: [] },
      { name: "2 Days Ago", data: [] }];

    // this._demoText = `step 0`;

    transactions.forEach((t: Transaction) => {
      // const date = Number(t.date.substr(8, 2));
      let date = t.date;
      if (date == null) {
        // this._demoText = `${t.toString()}`;
        return;
      }

      let dateNum = Number(t.date.substr(8, 2));
      if (dateNum == today.getDate()) {
        trans[0].data.push(t);
      } else if (dateNum == yesterday.getDate()) {
        trans[1].data.push(t);
      } else {
        trans[2].data.push(t);
      }
    });

    this.emptyTransactions = !trans.some(tr => tr.data.length > 0);

    console.log(`Calculated empty trans!`);
    console.log(trans);
    this._transactions = trans;
  }

  private calculateBar() {
    if (!this._signedIn || !this._linkedCredential) return;

    let absTotalThis = Math.abs(this._totalThisV);
    let absTotalLast = Math.abs(this._totalLastV);
    let absExceedThis = Math.abs(this._exceedThisV);
    let absExceedLast = Math.abs(this._exceedLastV);

    let total = absTotalThis > absTotalLast ? absTotalThis : absTotalLast;
    total = absExceedThis > total ? absExceedThis : total;
    total = absExceedLast > total ? absExceedLast : total;
    total = total == 0 ? 0.01 : total;
    console.log(`Calculating bar total: ${total}`);
    if (this.totalLast != null) this.totalLast.set(absTotalLast / total * 100);
    if (this.totalThis != null) this.totalThis.set(absTotalThis / total * 100);
    if (this.totalLastBelow != null) this.totalLastBelow.set(absTotalLast / total * 100);
    if (this.totalThisBelow != null) this.totalThisBelow.set(absTotalThis / total * 100);
    this.exceedLast.set(absExceedLast / total * 100);
    this.exceedThis.set(absExceedThis / total * 100);
    console.log(`${this._totalLastV}, ${this._totalThisV}`);
    console.log(`${this._exceedLastV}, ${this._exceedThisV}`);
    console.log(`${this._totalLastV / total * 100}, ${this._totalThisV / total * 100}`);
    console.log(`${this._exceedLastV / total * 100}, ${this._exceedThisV / total * 100}`);

    this._spendingMoreThis = absExceedThis > absTotalThis;
    this._spendingMoreLast = absExceedLast > absTotalLast;

    // if (this.totalLast == null ||
    //   this.totalThis == null ||
    //   this.exceedLast == null ||
    //   this.exceedThis == null ||
    //   this.totalLastBelow == null ||
    //   this.totalThisBelow == null)
    //   console.log(`Null element!`);
    console.log(`Calculated bar!`);
  }

  private getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  // private pushNotification() {
  //   const newMessage: Notification = {
  //     message: `Tap to view`,
  //     title: `Time to check your weekly finance summary!`
  //   };
  //   this.notificationCollections.add(newMessage);
  // }

  onApprove(ev) {
    if (ev.transaction != null) {
      let t = ev.transaction;
      this.plaidService.addTransactionRecord(this._userAccount.userId, t, true, this._user.email)
        .then(() => {
          this.plaidService.addMonthlyAmount(this._totalThisV, this._exceedThisV, t.amount);
          this.emptyTransactions = !this._transactions.some(tr => tr.data.length > 0);
          ev.item.setElementClass(`close`, true);
          setTimeout(() => {
            ev.group.data.splice(ev.index, 1);
          }, 300);
        })
        .catch(err => {
          this._demoText = err.message;
        });

      return;
    }

    // this._point += ev.point;
    ev.group.data.forEach(t => {
      this.plaidService.addTransactionRecord(this._userAccount.userId, t, true, this._user.email)
        .then(() => {
          this.plaidService.addMonthlyAmount(this._totalThisV, this._exceedThisV, t.amount);
          this.emptyTransactions = !this._transactions.some(tr => tr.data.length > 0);
        })
        .catch(err => {
          this._demoText = err.message;
        });
    });
    this._transactions.splice(this._transactions.indexOf(ev.group), 1);
  }

  onApproveFlag(ev) {
    this._point += ev.point;
    this._flaggedTransactions.splice(this._flaggedTransactions.indexOf(ev.transaction), 1);
  }

  onFlag(ev) {
    this.plaidService.addTransactionRecord(this._userAccount.userId, ev.transaction, false, this._user.email)
      .then(() => {
        this.plaidService.addMonthlyAmount(this._totalThisV, this._exceedThisV, ev.transaction.amount, ev.transaction.amount)
          .then(() => {
            ev.item.setElementClass(`close`, true);
            setTimeout(() => {
              ev.group.data.splice(ev.index, 1);
            }, 300);
            if (ev.group.data.length == 0) {
              this._transactions.splice(this._transactions.indexOf(ev.group), 1);
            }
            this.emptyTransactions = !this._transactions.some(tr => tr.data.length > 0);
          });
      })
      .catch(err => {
        this._demoText = err.message;
      });
  }

  goToDetail() {
    this.navCtrl.push(`TransDetailPage`, { userId: this._userAccount.userId, accessToken: this._userAccount.accessToken, userEmail: this._user.email });
  }

  linkAccount() {
    if (this._user.email == `demo@demo.com`) {
      this.environment = `sandbox`;
      // let newDoc = {} as UserAccount;
      // newDoc.userId = this._user.uid;
      // this.userAccountCollections.add(newDoc).then(() => {
      //   this.checkCredentials();
      // });
      // return;
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
            this.userAccountCollections.add(newDoc).then(() => {
              this.checkCredentials();
            });
            return;
          }
          this.plaidService.getAccessToken(public_token).then(access_token => {
            let newDoc = {} as UserAccount;
            newDoc.publicToken = public_token;
            newDoc.accessToken = access_token;
            newDoc.userId = this._user.uid;
            this.userAccountCollections.add(newDoc).then(() => {
              this.checkCredentials();
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
        this.userAccountCollections.add(newDoc).then(() => {
          this.checkCredentials();
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
        this.userAccountCollections.add(newDoc).then(() => {
          this.checkCredentials();
        });
      });
    });
    // browser.on('loaderror').subscribe(event => {
    //   console.log(`[InAppBrowser] On Load Error: What happened?, ${event.url}`);
    // });
  }

  signOut() {
    this.afAuth.auth.signOut().then(() => {
      this.navCtrl.setRoot(`LoginPage`);
    });
  }

  unbindAccount() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Unbind Account?',
      buttons: [
        {
          text: 'Unbind',
          role: 'unbind',
          handler: () => {
            // console.log('Destructive clicked');
            this._isLoading = true;
            this.userAccount.delete().then(() => {
              this.checkCredentials();
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

  resetDemoData() {
    this.plaidService.resetDemoData();
  }

  abs(x) {
    return Math.abs(x);
  }

  openMenu() {
    this.menuCtrl.open();
  }

}
