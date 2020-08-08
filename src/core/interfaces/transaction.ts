export interface Transaction {
 sender: string;
 recipient: string;
 signature: string;
 amount: number;
}

export type Transactions = Array<Transaction>;
