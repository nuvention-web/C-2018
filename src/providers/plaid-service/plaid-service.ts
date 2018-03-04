import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Transaction } from '../../models/transaction';

import plaid from 'plaid';

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

  constructor() {
    console.log('Hello PlaidService Provider');
    this.plaidClient = new plaid.Client(
      `5a8c91dc8d9239244b805dec`,              // client id
      `befea17a6a5e505a4e979c3915d746`,        // secret
      `5bd60517b0147259e73119216811f7`,        // public key
      plaid.environments.sandbox               // env
    );
  }

  private getAccessToken(public_token: string): Promise<string> {
    return new Promise<string>((resolve) => {
      console.log(`getting access token`);

      this.plaidClient.exchangePublicToken(public_token, (err, res) => {
        this.transactionSource.next(res.access_token);
        resolve(res.access_token);
      });
    });
  }

  public refreshTransaction(public_token: string) {
    this.getAccessToken(public_token).then(access_token => {
      const today = new Date();
      const daysAgo = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 30);
      this.plaidClient.getTransactions(
        access_token,
        // `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`,
        // `${daysAgo.getFullYear()}-${daysAgo.getMonth()}-${daysAgo.getDate()}`,
        `2017-01-01`,
        `2017-02-01`,
        (err, res) => {
          this._transactions = res.transactions;
          this.transactionSource.next(this._transactions);
        });
    });
  }

}
