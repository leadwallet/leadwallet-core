import { TransactionStatus } from "../enums";

export interface Transaction {
 id: string;
 sender: string;
 recipient: string;
 signature: string;
 amount: number;
 status: TransactionStatus;
}

export type Transactions = Array<Transaction>;
