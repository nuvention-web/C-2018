import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { HTTP } from '@ionic-native/http';
import plaid from 'plaid';

// import { Transaction } from '../../models/transaction';
import { UserTransaction } from '../../models/userTransaction';
import { UserMonthlyRecord } from '../../models/user-monthly-record';
import { Transaction } from '../../models/transaction';

/*
  Generated class for the PlaidService provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PlaidService {
  private _transactions: any;
  private transactionSource: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);
  transactions$: Observable<any[]> = this.transactionSource.asObservable();
  private plaidClient;

  private userTransCollections: AngularFirestoreCollection<UserTransaction>;

  //TODO change this to last Month's and this month's
  private _lastMonthAmounts: UserMonthlyRecord = null;
  private _lastMonthAmountSource: BehaviorSubject<UserMonthlyRecord> = new BehaviorSubject<UserMonthlyRecord>(null);
  lastMonthlyAmounts$: Observable<UserMonthlyRecord> = this._lastMonthAmountSource.asObservable();
  private _thisMonthAmounts: UserMonthlyRecord = null;
  private _thisMonthAmountSource: BehaviorSubject<UserMonthlyRecord> = new BehaviorSubject<UserMonthlyRecord>(null);
  thisMonthlyAmounts$: Observable<UserMonthlyRecord> = this._thisMonthAmountSource.asObservable();
  private _userMonthAmountsCollection: AngularFirestoreCollection<UserMonthlyRecord>;
  private _thisMonthAmount: AngularFirestoreDocument<UserMonthlyRecord> = null;
  private _lastMonthAmount: AngularFirestoreDocument<UserMonthlyRecord> = null;
  private environment: string;

  private _demoTransactionsCollection: AngularFirestoreCollection<Transaction>;

  private _testSource: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  testString$: Observable<any> = this._testSource.asObservable();

  constructor(private firestore: AngularFirestore, private http: HTTP) {
    console.log('Hello PlaidService Provider');
    this.plaidClient = new plaid.Client(
      `5a8c0e36bdc6a47debd6ee15`,              // client id
      `2ac6695774cef3665c793c1eb4a219`,        // secret
      `28f2e54388e2f6a1aca59e789d353b`,        // public key
      // plaid.environments.sandbox               // env
      plaid.environments.development               // env
    );

    this.userTransCollections = this.firestore.collection<UserTransaction>('user-transactions');
    this._demoTransactionsCollection = this.firestore.collection<Transaction>('demo-transactions');
    this._userMonthAmountsCollection = this.firestore.collection<UserMonthlyRecord>('user-monthly-amount');

    // this.environment = `sandbox`;
    this.environment = `development`;
  }

  public getMonthlyAmount(userId) {
    const now = new Date();
    let thisMonthNum = now.getMonth() + 1;
    const thisMonthStr = thisMonthNum >= 10 ? `${thisMonthNum}` : `0${thisMonthNum}`;
    const thisMonth = new Date(`${now.getFullYear()}-${thisMonthStr}-01`);
    const lastMonthStr = thisMonthNum == 1 ?
      `12` : thisMonthNum - 1 >= 10 ? `${thisMonthNum - 1}` : `0${thisMonthNum - 1}`;
    const lastYrStr = thisMonthNum == 1 ? `${now.getFullYear() - 1}` : `${now.getFullYear()}`;
    const lastMonth = new Date(`${lastYrStr}-${lastMonthStr}-01`);

    console.log(`[Monthly Amount] Getting monthly amount`);

    this._userMonthAmountsCollection.ref.where(`userId`, "==", userId)
      .where(`date`, "==", thisMonth).get().then(ref => {
        if (ref.empty) {
          console.log(`[Monthly Amount] Not found this month's record`);
          // create one!
          let item = {} as UserMonthlyRecord;
          item.date = thisMonth;
          item.exceedAmount = 0;
          item.totalAmount = 0;
          item.userId = userId;
          this._userMonthAmountsCollection.add(item).then(r => {
            console.log(`[Monthly Amount] Created this month's record`);
            this.getThisMonthlyAmountRecord(r.id);
          });
        } else {
          // this._testSource.next(`Get doc 0`);
          console.log(`[Monthly Amount] Found this month's record`);
          this.getThisMonthlyAmountRecord(ref.docs[0].id);
        }
      }).catch(err => { });
    this._userMonthAmountsCollection.ref.where(`userId`, "==", userId)
      .where(`date`, "==", lastMonth).get().then(ref => {
        if (ref.empty) {
          console.log(`[Monthly Amount] Not found last month's record`);
          // create one!
          let item = {} as UserMonthlyRecord;
          item.date = lastMonth;
          item.exceedAmount = 0;
          item.totalAmount = 0;
          item.userId = userId;
          this._userMonthAmountsCollection.add(item).then(r => {
            console.log(`[Monthly Amount] Created last month's record`);
            this.getLastMonthlyAmountRecord(r.id);
          });
        } else {
          // this._testSource.next(`Get doc 1`);
          console.log(`[Monthly Amount] Found last month's record`);
          this.getLastMonthlyAmountRecord(ref.docs[0].id);
        }
      });
  }

  private getThisMonthlyAmountRecord(docId) {
    console.log("[Monthly Amount] Getting Monthly Amount Record");
    this._thisMonthAmount = this.firestore.doc<UserMonthlyRecord>(`user-monthly-amount/${docId}`);
    this._thisMonthAmount.valueChanges().subscribe(
      record => {
        console.log("[Monthly Amount] Got Record");
        this._thisMonthAmounts = record;
        this._thisMonthAmountSource.next(this._thisMonthAmounts);
      }, error => {
        console.log("[Monthly Amount] Error Got Record");
        this._thisMonthAmountSource.next(this._thisMonthAmounts);
      }
    );
  }

  private getLastMonthlyAmountRecord(docId) {
    this._lastMonthAmount = this.firestore.doc<UserMonthlyRecord>(`user-monthly-amount/${docId}`);
    this._lastMonthAmount.valueChanges().subscribe(
      record => {
        this._lastMonthAmounts = record;
        this._lastMonthAmountSource.next(this._lastMonthAmounts);
      }, error => {
        this._lastMonthAmountSource.next(this._lastMonthAmounts);
      }
    );
  }

  public addMonthlyAmount(totalAmount, exceedAmount, totalAdd = 0, exceedAdd = 0): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this._thisMonthAmount.update({ totalAmount: totalAmount + totalAdd, exceedAmount: exceedAmount + exceedAdd })
        .then(() => {
          resolve();
        });
    });
  }

  public addLastMonthlyAmount(totalAmount, exceedAmount, totalAdd = 0, exceedAdd = 0): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this._lastMonthAmount.update({ totalAmount: totalAmount + totalAdd, exceedAmount: exceedAmount + exceedAdd })
        .then(() => {
          resolve();
        });
    });
  }

  public getAccessToken(public_token: string): Promise<string> {
    return new Promise<string>((resolve) => {
      console.log(`getting access token, ${public_token}`);

      const targetUrl = `http://Coinscious-env.tpg3qgcuzt.us-east-2.elasticbeanstalk.com/item/public_token/exchange`;

      const data = {
        body: {
          client_id: "5a8c0e36bdc6a47debd6ee15",
          secret: "2ac6695774cef3665c793c1eb4a219",
          public_token: public_token
        },
        environment: this.environment
      };

      this.http.setDataSerializer('json');
      this.http.post(targetUrl, data, { 'Content-Type': 'application/json' })
        .then(res => {
          res.data = JSON.parse(res.data);
          let access_token = res.data["access_token"];
          console.log(`received access token ${access_token}`);
          if (access_token != undefined) {
            resolve(access_token);
          }
        }).catch(err => {
          console.log(`get access token err. ${err.error}`);
        });
    });
  }

  public getTransactionRecords(userId, from, to): Promise<UserTransaction[]> {
    return new Promise<UserTransaction[]>((resolve, reject) => {
      this.userTransCollections.ref.where(`userId`, "==", userId)
        .where(`date`, ">", from).where(`date`, "<", to).orderBy(`date`, "desc")
        .get().then(
          ref => {
            if (!ref.empty) {
              // not empty;
              var result = [];
              ref.forEach(t => {
                result.push(t.data());
              });
              resolve(result);
            } else {
              resolve([]);
            }
          }
        ).catch(err => reject(err));
    });
  }

  public addTransactionRecord(userId, transaction, loved, email): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let t = {} as UserTransaction;
      t.userId = userId;
      t.transactionId = transaction.transaction_id;
      t.date = new Date(transaction.date);
      t.loved = loved;
      this.userTransCollections.add(t).then(r => resolve()).catch(err => reject(err));

      if (email == `demo@demo.com`) {
        this.addNewDemoTransaction(transaction);
      }
    });
  }

  public addTransactionRecords(userId, transactions, loved, email): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let batch = this.firestore.firestore.batch();
      transactions.forEach(tr => {
        let t = {} as UserTransaction;
        t.userId = userId;
        t.transactionId = tr.transaction_id;
        t.date = new Date(tr.date);
        t.loved = loved;
        batch.set(this.userTransCollections.doc(t.transactionId).ref, t);
      });
      batch.commit().then(() => {
        if (email == `demo@demo.com`) {
          this.addNewDemoTransactions(transactions);
        }
        resolve();
      }).catch(err => reject(err));
    });
  }

  public addDemoTransactionRecords(userId, transactions): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let batch = this.firestore.firestore.batch();
      transactions.forEach(tr => {
        let t = {} as UserTransaction;
        t.userId = userId;
        t.transactionId = tr.transaction_id;
        t.date = new Date(tr.date);
        t.loved = tr.love;
        batch.set(this.userTransCollections.doc(t.transactionId).ref, t);
      });
      batch.commit().then(() => {
        console.log(`added demo records`);
        this.addNewDemoTransactions(transactions).then(() => {
          console.log(`got callback transactions`);
          resolve();
        });
      }).catch(err => {
        console.log(`add demo records error`);
        reject(err);
      });
    });
  }

  public addNewDemoTransaction(transaction): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this._demoTransactionsCollection.add(transaction).then(r => resolve()).catch(err => reject(err));
    });
  }

  public addNewDemoTransactions(transactions): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let batch = this.firestore.firestore.batch();
      transactions.forEach(tr => {
        batch.set(this._demoTransactionsCollection.doc(tr.transaction_id).ref, tr);
      });
      console.log(`add new transactions`);
      batch.commit().then(() => {
        console.log(`added new transactions`);
        resolve();
      }).catch(err => {
        console.log(`add new transactions error`);
        reject(err);
      });
      // this._demoTransactionsCollection.add(transactions).then(r => resolve()).catch(err => reject(err));
    });
  }

  public getDemoTransactions(): Promise<Transaction[]> {
    return new Promise<Transaction[]>((resolve, reject) => {
      this._demoTransactionsCollection.valueChanges().subscribe(transactions => {
        resolve(transactions);
      }, err => {
        reject(err);
      });
    });
  }

  public resetDemoData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this._demoTransactionsCollection.ref.get().then(qry => {
        let batch = this.firestore.firestore.batch();
        qry.forEach(doc => {
          batch.delete(doc.ref);
        });
        batch.update(this._thisMonthAmount.ref, { totalAmount: 0, exceedAmount: 0 });
        batch.update(this._lastMonthAmount.ref, { totalAmount: 0, exceedAmount: 0 });
        batch.commit().then(() => {
          // reset this month to zero
          resolve();
        });
      });
    });
  }

  public refreshTransaction(access_token: string) {
    // this.transactionSource.next([access_token]);
    const today = new Date();
    const daysAgo = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 3);

    return this.getTransactionsWithTimeRange(access_token, daysAgo, today);
  }

  public getTransactionsWithTimeRange(access_token: string, from: Date, to: Date): Promise<any> {
    const today = to;
    const daysAgo = from;
    const tm = today.getMonth() < 9 ? `0${today.getMonth() + 1}` : `${today.getMonth()}`;
    const td = today.getDate() < 10 ? `0${today.getDate()}` : `${today.getDate()}`;
    const am = daysAgo.getMonth() < 9 ? `0${daysAgo.getMonth() + 1}` : `${daysAgo.getMonth()}`;
    const ad = daysAgo.getDate() < 10 ? `0${daysAgo.getDate()}` : `${daysAgo.getDate()}`;
    const todayString = `${today.getFullYear()}-${tm}-${td}`;
    const daysAgoString = `${daysAgo.getFullYear()}-${am}-${ad}`;

    const targetUrl = `http://Coinscious-env.tpg3qgcuzt.us-east-2.elasticbeanstalk.com/transactions/get`;

    const data = {
      body: {
        client_id: "5a8c0e36bdc6a47debd6ee15",
        secret: "2ac6695774cef3665c793c1eb4a219",
        access_token: access_token,
        start_date: daysAgoString,
        end_date: todayString
      },
      environment: this.environment
    };

    return new Promise<any>((resolve, reject) => {
      this.http.setDataSerializer('json');
      console.log(`getting transaction.`);
      console.log(data);
      this.http.post(targetUrl, data, { 'Content-Type': 'application/json' })
        .then(res => {
          res.data = JSON.parse(res.data);
          console.log(`got transaction response`);
          resolve(res.data.transactions);
        }).catch(err => {
          console.log(`get transaction err. ${err.error}`);
        });
    });
  }

  public refreshThisMonthTransaction(public_token: string) {
    this.getAccessToken(public_token).then(access_token => {
      const today = new Date();
      const daysAgo = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 30);
      this.plaidClient.getTransactions(
        access_token,
        `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`,
        `${daysAgo.getFullYear()}-${daysAgo.getMonth()}-${daysAgo.getDate()}`,
        // `2017-04-01`,
        // `2017-05-01`,
        (err, res) => {
          this._transactions = res.transactions;
          this.transactionSource.next(this._transactions);
        });
    });
  }



  public refreshLastMonthTransaction(public_token: string) {
    this.getAccessToken(public_token).then(access_token => {
      const today = new Date();
      const daysAgo = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 2);
      this.plaidClient.getTransactions(
        access_token,
        `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`,
        `${daysAgo.getFullYear()}-${daysAgo.getMonth()}-${daysAgo.getDate()}`,
        // `2017-03-01`,
        // `2017-04-01`,
        (err, res) => {
          this._transactions = res.transactions;
          this.transactionSource.next(this._transactions);
        });
    });
  }

  public getAllTransactions(public_token: string, from, to) {
    this.getAccessToken(public_token).then(access_token => {
      this.plaidClient.getTransactions(
        access_token,
        `${from.getFullYear()}-${from.getMonth()}-${from.getDate()}`,
        `${to.getFullYear()}-${to.getMonth()}-${to.getDate()}`,
        // `2017-03-01`,
        // `2017-04-01`,
        (err, res) => {
          this._transactions = res.transactions;
          this.transactionSource.next(this._transactions);
          console.log("getAllTransactions length 2: " + this._transactions.length.toString());
        });
      console.log("getAllTransactions length 1: " + this._transactions.length.toString());
    });
  }

  public refreshLastLogin(userId, date) {

  }
}
