export class Transaction {
  account_id: string;
  account_owner: string;
  amount: number;
  category: string[];
  category_id: string;
  date: string;
  location: any;          // TODO give it a new object
  name: string;
  payment_meta: any;      // TODO give it a new object
  pending: boolean;
  pending_transaction_id: string;
  transaction_id: string;
  transaction_type: string;
}
