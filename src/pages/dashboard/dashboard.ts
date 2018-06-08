import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ActionSheetController, Events } from 'ionic-angular';
import { MenuController } from 'ionic-angular';
// import { PushObject, PushOptions, NotificationEventResponse } from '@ionic-native/push';
// import { Push } from '@ionic-native/push';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgProgressComponent } from '@ngx-progressbar/core';
// import { Observable } from "rxjs/Observable";
import { ISubscription, Subscription } from "rxjs/Subscription";

import { Notification } from '../../models/notification';
import { UserAccount } from '../../models/userAccount';
import { User } from '../../models/user';
import { Transaction } from '../../models/transaction';
import { UserTransaction } from '../../models/userTransaction';
import { PlaidService } from '../../providers/plaid-service/plaid-service';

declare var cordova;
declare var Plaid;
declare var PushNotification;

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

  private userAccount: AngularFirestoreDocument<UserAccount>;
  private _userAccount: UserAccount;
  public _demoText: string = `No message.`;
  private months = [`Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`];
  private _transactions: any = [];
  private _transHistory: UserTransaction[] = null;
  private _user: User;
  public emptyTransactions = true;

  private _totalThisSave = 0;
  private _exceedThisSave = 0;
  private _totalLastV = 0.00;
  private _exceedLastV = 0.00;
  private _totalThisV = 0.00;
  private _exceedThisV = 0.00;
  private _spendingMoreThis = false;
  private _spendingMoreLast = false;

  private _subscriptions = [];

  private linkHandler;
  private environment = `development`;

  private demoTrans = [
    {
      dateOffset: 1, // yesterday
      transactions: [
        { name: `AMAZON MKTPLACE`, amount: 75, love: false },
        { name: `TKNAMEBAR & RESTAURANT`, amount: 42.63, love: false },
        { name: `THE SECOND CITY THEATER`, amount: 62, love: false },
        { name: `Uber 063015 SF**POOL**`, amount: 15, love: false },
        { name: `LYFT *RIDE LYFT.COM`, amount: 18, love: false }
      ]
    },
    {
      dateOffset: 24,
      transactions: [
        { name: `AMAZON MKTPLACE`, amount: 216, love: true },
        { name: `Trader Joe's`, amount: 37.57, love: false },
        { name: `T.K. Foodservice`, amount: 12.84, love: false }
      ]
    },
    {
      dateOffset: 32,
      transactions: [
        { name: `Airbnb`, amount: 100, love: true },
        { name: `Men's Warehouse`, amount: 40, love: true },
        { name: `DSW, Inc.`, amount: 20, love: true }
      ]
    },
    {
      dateOffset: 0,
      transactions: [
        { name: `VENTRA WEBSITE 877-669-8368`, amount: 105, love: false },
        { name: `AMAZON MKTPLACE`, amount: 25, love: false },
        { name: `Domino's Pizza`, amount: 37.87, love: false },
        { name: `Sluggers World Class Sports Bar`, amount: 24, love: false },
        { name: `LYFT *RIDE LYFT.COM`, amount: 18, love: false },
        { name: `AMAZON MKTPLACE`, amount: 258, love: false },
        { name: `United Airlines`, amount: 315, love: false }
      ]
    }
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
    private iab: InAppBrowser,
    private events: Events
  ) {

    // this.checkAuthState();
    if (this.navParams.get(`user`)) {
      this._user = this.navParams.get(`user`);
    }
    if (this.navParams.get(`userAccount`)) {
      this._userAccount = this.navParams.get(`userAccount`);
    }
    if (this.navParams.get(`userAccountId`)) {
      this.userAccount = this.firestore.doc<UserAccount>(`user-accounts/${this.navParams.get(`userAccountId`)}`);
    }

    this.events.subscribe(`demo:addDemoTrans`, () => { this.addDemoTrans() });
    this.events.subscribe(`demo:removeDemoTrans`, () => { this.removeDemoTrans() });
    this.events.subscribe(`demo:saveMonthValues`, () => { this.saveMonthValues() });
    this.events.subscribe(`demo:restoreMonthValues`, () => { this.restoreMonthValues() });
    this.events.subscribe(`demo:playBarAnim`, () => { this.playBarAnim() });
    this.events.subscribe(`demo:stopBarAnim`, () => { this.stopBarAnim() });
  }

  ionViewWillEnter() {
  }

  ionViewWillLeave() {
    // this._platformSubscriber.unsubscribe();
    this._subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
  }

  ionViewDidEnter() {
  }

  ionViewDidLoad() {
    console.log(`Dashboard loaded`);
    this.events.publish(`app:pageLoaded`);
    this.initPage();
  }

  private initPage() {
    if (this._userAccount == null) return;
    console.log(`received user account`);
    console.log(this._userAccount);
    // this._userAccount = ua;
    // Demo process for demo@demo.com

    this.initOthers();

    if (this._user.email == `demo@demo.com`) {
      // this._isLoading = false;
      // this._linkedCredential = true;
      this.emptyTransactions = false;
      this.refreshDemoTransactions();
      this.plaidService.getMonthlyAmount(this._user.uid);
      this.userAccount.update({ lastSignIn: new Date() });

      this.events.publish(`app:inboxTourReady`);

      return;
    }

    if (this._userAccount.unflaggedCount == null) {
      this.userAccount.update({ unflaggedCount: 0 });
      this._userAccount.unflaggedCount = 0;
    }

    // get transaction data we have
    let to = new Date();
    let from = this._userAccount.lastSignIn;
    if (from == null) from = new Date(to.getTime() - 1000 * 60 * 60 * 24 * 3);

    // Get new transactions from last login
    this.plaidService.getTransactionsWithTimeRange(this._userAccount.accessToken, from, to).then(newTransactions => {
      // Add those new transactions into database
      console.log(`[Unflagged Transactions] Got new Transactions`);
      this.plaidService.addNewTransactions(this._userAccount.userId, newTransactions.filter(t => t.amount > 0 && !t.pending)).then(() => {
        console.log(`[Unflagged Transactions] Added new Transactions`);
        this.plaidService.getUnflaggedTransactions(this._userAccount.userId).then(unflaggedTransactions => {
          // Calc the oldest time & get transactions from plaid
          console.log(`[Unflagged Transactions] Got unflagged Transactions`);
          // console.log(unflaggedTransactions);
          let fromTime = new Date(unflaggedTransactions[unflaggedTransactions.length - 1].date);
          // Get old transactions unflagged (How???)
          this.plaidService.getTransactionsWithTimeRange(this._userAccount.accessToken, fromTime, to).then(transactions => {
            this.shapeTransactions(transactions.filter(t => unflaggedTransactions.some(ut => ut.transactionId == t.transaction_id)));
            this.userAccount.update({ lastSignIn: to }).then(() => this.events.publish(`app:inboxTourReady`));
          });
        }).catch(err => console.log(`get unflagged transactions error`));
      }).catch(err => console.log(`add new transactions error`));
    }).catch(err => console.log(`get new transactions error`));

    this.plaidService.getMonthlyAmount(this._userAccount.userId);
  }

  private initOthers() {

    // this.push.hasPermission().then(
    //   (res: any) => {
    //     if (res.isEnabled) {
    //       console.log('We have permission to send push notifications');
    //     } else {
    //       console.log('We do not have permission to send push notifications');
    //     }
    //   }
    // );

    // const options = {
    //   android: {
    //     senderID: `618786705474`,
    //     topics: [
    //       `coincious.general`
    //     ]
    //   },
    //   ios: {
    //     alert: true,
    //     badge: false,
    //     sound: true,
    //     fcmSandbox: true,
    //     // topics: [
    //     //   `coincious.general`
    //     // ]
    //   },
    //   windows: {},
    //   browser: {
    //     pushServiceURL: 'http://push.api.phonegap.com/v1/push'
    //   }
    // };
    //
    // cordova.plugins.notification.local.getIds(ids => {
    //   if (ids.length == 0) return;
    //   cordova.plugins.notification.local.clearAll(ids);
    // })
    //
    // cordova.plugins.notification.local.schedule({
    //   title: 'Time to check your payments',
    //   text: 'Click me and see details',
    //   trigger: { every: { weekday: 5, hour: 20, minute: 0 } }
    //   // ,actions: [
    //   //   { id: 'yes', title: 'Yes' },
    //   //   { id: 'no', title: 'No' },
    //   //   { id: 'edit', title: 'Edit' }
    //   // ]
    // });

    // cordova.plugins.notification.local.schedule([
    //   {
    //     id: 1,
    //     title: 'Registration',
    //     text: 'Registered',
    //     foreground: true
    //     // ,actions: [
    //     //   { id: 'yes', title: 'Yes' },
    //     //   { id: 'no', title: 'No' },
    //     //   { id: 'edit', title: 'Edit' }
    //     // ]
    //   }
    // ]);

    // const pushObject: PushObject = this.push.init(options);
    // const pushObject = PushNotification.init(options);

    // pushObject.unregister(() => console.log(`[Push] unregistered`), () => console.log(`[Push] unregister error`));

    // pushObject.on('notification', notification => {
    //   console.log(`[Push] received message, title: ${notification.title}, message: ${notification.message}`);
    //   cordova.plugins.notification.local.schedule([
    //     {
    //       id: 1,
    //       title: notification.title,
    //       text: notification.message,
    //       foreground: true
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
    // pushObject.on('registration', registration => {
    //   console.log(`[Push] Device registered, id: ${registration.registrationId}, type: ${registration.registrationType}`);
    //   cordova.plugins.notification.local.schedule([
    //     {
    //       id: 1,
    //       title: 'Registration',
    //       text: 'Registered',
    //       foreground: true
    //       // ,actions: [
    //       //   { id: 'yes', title: 'Yes' },
    //       //   { id: 'no', title: 'No' },
    //       //   { id: 'edit', title: 'Edit' }
    //       // ]
    //     }
    //   ]);
    // });
    // pushObject.on('error', error => console.error(`[Push] Error with Push plugin: ${error.message}`));

    this._subscriptions.push(
      this.plaidService.lastMonthlyAmounts$.subscribe(record => {
        console.log(`[Monthly Record] Got last month record.`);
        console.log(record);
        if (record == null) return;
        // this.zone.run(() => {
        // });
        if (record != null) {
          this._totalLastV = record.totalAmount;
          this._exceedLastV = record.exceedAmount;
        }
        this.calculateBar();
      })
    );
    this._subscriptions.push(
      this.plaidService.thisMonthlyAmounts$.subscribe(record => {
        console.log(`[Monthly Record] Got this month record.`);
        console.log(record);
        if (record == null) return;
        // this.zone.run(() => {
        // });
        if (record != null) {
          this._totalThisV = record.totalAmount;
          this._exceedThisV = record.exceedAmount;
        }
        this.calculateBar();
      })
    );

    this._subscriptions.push(
      this.plaidService.testString$.subscribe(s => {
        this.zone.run(() => {
          this._demoText = s;
        });
      })
    );
  }

  private refreshDemoTransactions() {
    let trans = [
      { name: "Today", data: [], isDemo: true },
      { name: "Yesterday", data: [], isDemo: true },
      { name: "2 Days Ago", data: [], isDemo: true }];
    let date = new Date();
    let dateCounter = 0;

    this.demoTrans.forEach(dayTran => {
      let dateOffset = dayTran.dateOffset;
      if (dateOffset > 3) return;

      const target = new Date(date.getTime() - 1000 * 60 * 60 * 24 * dateOffset);

      let thisMonthNum = target.getMonth() + 1;
      const thisDateNum = target.getDate();
      const thisMonthStr = thisMonthNum >= 10 ? `${thisMonthNum}` : `0${thisMonthNum}`;
      const thisDateStr = thisDateNum >= 10 ? `${thisDateNum}` : `0${thisDateNum}`;
      const dateStr = `${target.getFullYear()}-${thisMonthStr}-${thisDateStr}`;

      dayTran.transactions.forEach(t => {
        let newTran = JSON.parse(JSON.stringify(t));
        newTran.date = dateStr;
        newTran.transaction_id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
        trans[dateOffset].data.push(newTran);
      })
    });

    this._transactions = trans;
  }

  private addDemoTrans() {
    this._transactions.unshift(
      {
        name: `Date that you know`,
        isDemo: true,
        data: [
          {
            name: `Thing you have bought`,
            amount: 10,
            isDemo: true
          }
        ]
      }
    );
    this.emptyTransactions = !this._transactions.some(tr => tr.data.length > 0);
  }

  private removeDemoTrans() {
    this._transactions = this._transactions.filter(t => t.isDemo != true);
  }

  private saveMonthValues() {
    this._exceedThisSave = this._exceedThisV;
    this._totalThisSave = this._totalThisV;
  }

  private restoreMonthValues() {
    this._exceedThisV = this._exceedThisSave;
    this._totalThisV = this._totalThisSave;
  }

  private animTimer;
  private animCounter = 0;

  private playBarAnim() {
    this.saveMonthValues();
    let f = () => {
      let add = Math.random() * 100;
      this._totalThisV += add;
      this._exceedThisV += Math.random() * add;
      this.animCounter++;
      if (this.animCounter > 4) {
        this.animCounter = 0;
        this.restoreMonthValues();
      }
      this.calculateBar();
      this.animTimer = setTimeout(
        f, 1200
      );
    };
    this.animTimer = setTimeout(
      () => {
        f();
      }, 1200
    );
  }

  private stopBarAnim() {
    this.restoreMonthValues();
    clearTimeout(this.animTimer);
  }

  private shapeTransactions(transactions) {
    let trans = [], dates = {};
    let nowTime = new Date().getTime();
    const today = new Date((Math.floor(nowTime / 86400000) - 1) * 86400000).getTime();
    transactions.forEach(t => {
      if (dates[t.date] == null) {
        dates[t.date] = trans.length;
        let name = `${this.months[parseInt(t.date.substring(5, 7)) - 1]} ${t.date.substring(8, 10)}`;
        let diff = (today - new Date(t.date).getTime()) / 86400000;
        if (diff < 0) {
          name = `Today`;
          // console.log(`diff: ${diff}, today: ${today}, date: ${new Date(t.date).getTime()}`);
        } else if (diff < 1) {
          name = `Yesterday`;
        } else if (diff < 2) {
          name = `2 days ago`;
        }
        trans.push({ name: `${name}`, data: [] });
      }
      trans[dates[t.date]].data.push(t);
    });
    this.emptyTransactions = !trans.some(tr => tr.data.length > 0);
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

  private calculateBar(demoTotal = null, demoExceed = null) {
    let absTotalThis = Math.abs(this._totalThisV);
    let absTotalLast = Math.abs(this._totalLastV);
    absTotalThis = demoTotal ? demoTotal : absTotalThis;
    let absExceedThis = Math.abs(this._exceedThisV);
    let absExceedLast = Math.abs(this._exceedLastV);
    absExceedThis = demoExceed ? demoExceed : absExceedThis;

    let total = absTotalThis > absTotalLast ? absTotalThis : absTotalLast;
    total = absExceedThis > total ? absExceedThis : total;
    total = absExceedLast > total ? absExceedLast : total;
    total = total == 0 ? 0.01 : total;
    console.log(`Calculating bar total: ${total}`);
    if (this.totalLast != null) this.totalLast.set(absTotalLast / total * 100);
    if (this.totalThis != null) this.totalThis.set(absTotalThis / total * 100);
    if (this.totalLastBelow != null) this.totalLastBelow.set(absTotalLast / total * 100);
    if (this.totalThisBelow != null) this.totalThisBelow.set(absTotalThis / total * 100);
    if (this.exceedLast != null) this.exceedLast.set(absExceedLast / total * 100);
    if (this.exceedThis != null) this.exceedThis.set(absExceedThis / total * 100);
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
      // single transaction
      let t: Transaction = ev.transaction;

      if (t.isDemo) {
        ev.item.setElementClass(`close`, true);
        this.calculateBar(this._totalThisV + t.amount, this._exceedThisV);
        this._totalThisV = this._totalThisV + t.amount;
        this._exceedThisV = this._exceedThisV;
        setTimeout(() => {
          ev.group.data.splice(ev.index, 1);
          this.emptyTransactions = !this._transactions.some(tr => tr.data.length > 0);
        }, 300);
        return;
      }

      this.plaidService.flagTransaction(this._userAccount.userId, t, true, this._user.email)
        .then(() => {
          this.plaidService.addMonthlyAmount(this._userAccount.userId, t, t.amount);
          ev.item.setElementClass(`close`, true);
          setTimeout(() => {
            ev.group.data.splice(ev.index, 1);
            this.emptyTransactions = !this._transactions.some(tr => tr.data.length > 0);
          }, 300);
        }).catch(err => {
          this._demoText = err.message;
          console.log(err.message);
        });

      return;
    }

    console.log(ev.group);


    if (ev.group.isDemo) {
      let sum = 0;
      ev.group.data.forEach(t => {
        sum += t.amount;
      });
      this.calculateBar(this._totalThisV + sum, this._exceedThisV);
      this._totalThisV = this._totalThisV + sum;
      this._exceedThisV = this._exceedThisV;
      this._transactions.splice(this._transactions.indexOf(ev.group), 1);
      this.emptyTransactions = !this._transactions.some(tr => tr.data.length > 0);
      console.log(`Empty transactions? ${this.emptyTransactions}`);
      console.log(this._transactions);
      return;
    }

    this.plaidService.flagTransactions(this._userAccount.userId, ev.group.data, true, this._user.email)
      .then(() => {
        let sum = 0;
        ev.group.data.forEach(t => {
          sum += t.amount;
        });
        this._transactions.splice(this._transactions.indexOf(ev.group), 1);
        this.emptyTransactions = !this._transactions.some(tr => tr.data.length > 0);
        this.plaidService.addMonthlyAmount(this._userAccount.userId, ev.group.data[0], sum);
      }).catch(err => {
        this._demoText = err.message;
        console.log(err.message);
      });
  }

  onFlag(ev) {
    if (ev.transaction.isDemo) {
      ev.item.setElementClass(`close`, true);
      this.calculateBar(this._totalThisV + ev.transaction.amount, this._exceedThisV + ev.transaction.amount);
      this._totalThisV = this._totalThisV + ev.transaction.amount;
      this._exceedThisV = this._exceedThisV + ev.transaction.amount;
      setTimeout(() => {
        ev.group.data.splice(ev.index, 1);
        this.emptyTransactions = !this._transactions.some(tr => tr.data.length > 0);
      }, 300);
      return;
    }

    this.plaidService.flagTransaction(this._userAccount.userId, ev.transaction, false, this._user.email)
      .then(() => {
        this.plaidService.addMonthlyAmount(this._userAccount.userId, ev.transaction, ev.transaction.amount, ev.transaction.amount)
          .then(() => {
            ev.item.setElementClass(`close`, true);
            setTimeout(() => {
              ev.group.data.splice(ev.index, 1);
            }, 300);
            if (ev.group.data.length == 0) {
              this._transactions.splice(this._transactions.indexOf(ev.group), 1);
              this.emptyTransactions = !this._transactions.some(tr => tr.data.length > 0);
            }
          });
      }).catch(err => {
        this._demoText = err.message;
        console.log(err.message);
      });
  }

  goToDetail() {
    // this.navCtrl.push(`TransDetailPage`, { userId: this._userAccount.userId, accessToken: this._userAccount.accessToken, userEmail: this._user.email });
    //this.navCtrl.push(`DetailPage`, { userId: this._userAccount.userId, accessToken: this._userAccount.accessToken, userEmail: this._user.email });
    this.events.publish(`nav:go-to-archive`);
    //  this.gotoSummaryDetail(0);
  }

  abs(x) {
    return Math.abs(x);
  }

  openMenu() {
    this.menuCtrl.open();
  }



  /*
      private _transactions2: any = [];
      gotoSummaryDetail(clickedElementindex) {
          let trans = {};
          this.plaidService.getTransactionsWithTimeRange(this._userAccount.accessToken, new Date(2018, 4), new Date(2018, 5)).then(res => {
              res.forEach(t => {
                  trans[t["transaction_id"]] = t;
              });
          }).then(() => {
              this.plaidService.getTransactionRecords(this._userAccount.accessToken, new Date(2018, 4), new Date(2018, 5)).then(r => {
                  this._transactions2.length = 0;
                  let result = r.filter(t => t.flagged == true || t.flagged == null);
                  console.log(r);
                  result.forEach(t => {
                      let target = trans[t["transactionId"]];
                      if (target != null && t["date"].getDay() == clickedElementindex) {
                          target["loved"] = t["loved"];
                          this._transactions2.push(target);
                      }
                  });
              });
          });
      }
      */
}
