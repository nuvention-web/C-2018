export interface UserTransaction {
  userId: string;
  transactionId: string;
  date: Date;
  loved: boolean;
  flagged: boolean;
}
