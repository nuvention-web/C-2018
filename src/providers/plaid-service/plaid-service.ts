import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { TransactionResponse } from '../../models/transactionResponse';
import { Transaction } from '../../models/transaction';

import plaid from 'plaid';

/*
  Generated class for the PlaidService provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PlaidService {
  private _transactions: any[];
  private transactionSource: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  transactions$: Observable<any> = this.transactionSource.asObservable();
  private plaidClient;

  constructor(private http: HttpClient) {
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
      this.transactionSource.next(`Getting access token`);

      this.plaidClient.exchangePublicToken(public_token, (err, res) => {
        this.transactionSource.next(res.access_token);
        resolve(res.access_token);
      });

      // this.http.post<any>(
      //   'https://sandbox.plaid.com/item/public_token/exchange',
      //   JSON.stringify({
      //     "client_id": "5a8c91dc8d9239244b805dec",
      //     "secret": "befea17a6a5e505a4e979c3915d746",
      //     "public_token": public_token
      //   }),
      //   {
      //     headers: {
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // ).toPromise().then(res => {
      //   console.log(`got access token`);
      //   resolve(res.access_token);
      // }).catch(err => {
      //   console.log(`err, ${err.message}`);
      // });
    });
  }

  public refreshTransaction(public_token: string) {
    // console.log(`refreshing transaction, public token: ${public_token}`);
    this.getAccessToken(public_token).then(access_token => {
      // console.log(`got access token`);
      // this.http.post<any>(
      //   `https://sandbox.plaid.com/transactions/get`,
      //   JSON.stringify({
      //     "client_id": "5a8c91dc8d9239244b805dec",
      //     "secret": "befea17a6a5e505a4e979c3915d746",
      //     "access_token": access_token,
      //     "start_date": "2017-01-01",
      //     "end_date": "2017-02-01"
      //   }),
      //   {
      //     headers: {
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // ).toPromise().then(r => {
      //   // this.page.updateLinkStatus();
      //   // this.page.updateTransactions(r.transactions);
      //   // this._transactions = r.transactions;
      //   this._transactions = access_token;
      //   this.transactionSource.next(this._transactions);
      // });

      this.plaidClient.getTransactions(
        access_token,
        `2017-01-01`,
        `2017-02-01`,
        (err, res) => {
          this._transactions = res.transactions;
          // this.transactionSource.next(this._transactions);
          this.transactionSource.next(this._transactions);
        });
    });
  }

}
