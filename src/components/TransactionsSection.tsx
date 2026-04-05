import { useState, useEffect } from "react";
import { getTransactions, type Transaction } from "@/lib/transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const typeBadge: Record<Transaction["type"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  book_added: { label: "Added", variant: "default" },
  book_updated: { label: "Updated", variant: "secondary" },
  book_deleted: { label: "Deleted", variant: "destructive" },
  book_issued: { label: "Issued", variant: "outline" },
  book_returned: { label: "Returned", variant: "default" },
};

const TransactionsSection = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const filtered = transactions.filter(
    (t) =>
      t.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.memberName?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search transactions..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardHeader><CardTitle className="font-heading">Transaction History</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Book</TableHead>
                  <TableHead className="hidden sm:table-cell">Member</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No transactions found</TableCell></TableRow>
                ) : filtered.map((tx) => {
                  const badge = typeBadge[tx.type];
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="whitespace-nowrap">{tx.date}</TableCell>
                      <TableCell><Badge variant={badge.variant}>{badge.label}</Badge></TableCell>
                      <TableCell className="font-medium">{tx.bookTitle}</TableCell>
                      <TableCell className="hidden sm:table-cell">{tx.memberName ?? "—"}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{tx.description}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsSection;
