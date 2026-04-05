export interface Transaction {
  id: string;
  type: "book_added" | "book_updated" | "book_deleted" | "book_issued" | "book_returned";
  description: string;
  bookTitle: string;
  memberName?: string;
  date: string;
}

const TX_KEY = "library_transactions";

const SEED_TRANSACTIONS: Transaction[] = [
  { id: "t1", type: "book_issued", description: "Book issued to Alice Johnson", bookTitle: "To Kill a Mockingbird", memberName: "Alice Johnson", date: "2026-03-20" },
  { id: "t2", type: "book_issued", description: "Book issued to Bob Smith", bookTitle: "1984", memberName: "Bob Smith", date: "2026-03-15" },
  { id: "t3", type: "book_returned", description: "Book returned by Carol Davis", bookTitle: "The Catcher in the Rye", memberName: "Carol Davis", date: "2026-03-28" },
  { id: "t4", type: "book_issued", description: "Book issued to Alice Johnson", bookTitle: "Pride and Prejudice", memberName: "Alice Johnson", date: "2026-03-25" },
  { id: "t5", type: "book_added", description: "New book added to collection", bookTitle: "The Great Gatsby", date: "2026-03-01" },
];

export function getTransactions(): Transaction[] {
  const stored = localStorage.getItem(TX_KEY);
  if (!stored) {
    localStorage.setItem(TX_KEY, JSON.stringify(SEED_TRANSACTIONS));
    return SEED_TRANSACTIONS;
  }
  return JSON.parse(stored);
}

export function addTransaction(tx: Omit<Transaction, "id" | "date">): Transaction {
  const txs = getTransactions();
  const newTx: Transaction = { ...tx, id: crypto.randomUUID(), date: new Date().toISOString().split("T")[0] };
  txs.unshift(newTx);
  localStorage.setItem(TX_KEY, JSON.stringify(txs));
  return newTx;
}
