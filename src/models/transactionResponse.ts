import { Transaction } from './transaction'

export class TransactionResponse {
  accounts: any[];              // TODO give it a class
  item: any;                    // TODO give it a class
  request_id: string;
  total_transactions: number;
  transactions: Transaction[];
}
