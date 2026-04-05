import { useState, useEffect } from "react";
import { getMembers, getIssuedBooks, addMember, issueBook, returnBook, type Member, type IssuedBook } from "@/lib/members";
import { addTransaction } from "@/lib/transactions";
import { getBooks } from "@/lib/books";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, BookUp, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";

const MembersSection = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [issued, setIssued] = useState<IssuedBook[]>([]);
  const [search, setSearch] = useState("");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: "", email: "", phone: "", memberSince: new Date().toISOString().split("T")[0] });
  const [issueForm, setIssueForm] = useState({ memberId: "", bookId: "", bookTitle: "", issuedDate: new Date().toISOString().split("T")[0], dueDate: "" });

  const refresh = () => {
    setMembers(getMembers());
    setIssued(getIssuedBooks());
  };

  useEffect(() => { refresh(); }, []);

  const books = getBooks();

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    addMember(memberForm);
    toast.success("Member added");
    setMemberForm({ name: "", email: "", phone: "", memberSince: new Date().toISOString().split("T")[0] });
    setAddMemberOpen(false);
    refresh();
  };

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const book = books.find((b) => b.id === issueForm.bookId);
    const member = members.find((m) => m.id === issueForm.memberId);
    if (!book) return;
    issueBook({ ...issueForm, bookTitle: book.title });
    addTransaction({ type: "book_issued", description: `Book issued to ${member?.name ?? "Unknown"}`, bookTitle: book.title, memberName: member?.name });
    toast.success("Book issued");
    setIssueForm({ memberId: "", bookId: "", bookTitle: "", issuedDate: new Date().toISOString().split("T")[0], dueDate: "" });
    setIssueOpen(false);
    refresh();
  };

  const handleReturn = (id: string) => {
    const item = issued.find((i) => i.id === id);
    const member = members.find((m) => m.id === item?.memberId);
    returnBook(id);
    if (item) addTransaction({ type: "book_returned", description: `Book returned by ${member?.name ?? "Unknown"}`, bookTitle: item.bookTitle, memberName: member?.name });
    toast.success("Book returned");
    refresh();
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  );

  const getIssuedForMember = (memberId: string) => issued.filter((i) => i.memberId === memberId && !i.returnedDate);

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="issued">Issued Books</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search members..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
              <DialogTrigger asChild>
                <Button><UserPlus className="mr-2 h-4 w-4" /> Add Member</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-heading">Add New Member</DialogTitle></DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4 pt-2">
                  <div className="space-y-2"><Label>Name</Label><Input required value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" required value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input required value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} /></div>
                  <Button type="submit" className="w-full">Add Member</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader><CardTitle className="font-heading">Library Members</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="hidden sm:table-cell">Phone</TableHead>
                      <TableHead className="hidden sm:table-cell">Member Since</TableHead>
                      <TableHead>Books Issued</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No members found</TableCell></TableRow>
                    ) : filteredMembers.map((member) => {
                      const memberIssued = getIssuedForMember(member.id);
                      return (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell className="hidden sm:table-cell">{member.phone}</TableCell>
                          <TableCell className="hidden sm:table-cell">{member.memberSince}</TableCell>
                          <TableCell>
                            {memberIssued.length > 0 ? (
                              <div className="space-y-1">
                                {memberIssued.map((i) => (
                                  <Badge key={i.id} variant="secondary" className="mr-1 text-xs">{i.bookTitle}</Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">None</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issued" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
              <DialogTrigger asChild>
                <Button><BookUp className="mr-2 h-4 w-4" /> Issue Book</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-heading">Issue a Book</DialogTitle></DialogHeader>
                <form onSubmit={handleIssue} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Member</Label>
                    <Select value={issueForm.memberId} onValueChange={(v) => setIssueForm({ ...issueForm, memberId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                      <SelectContent>{members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Book</Label>
                    <Select value={issueForm.bookId} onValueChange={(v) => setIssueForm({ ...issueForm, bookId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select book" /></SelectTrigger>
                      <SelectContent>{books.filter((b) => b.available > 0).map((b) => <SelectItem key={b.id} value={b.id}>{b.title} ({b.available} available)</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="date" required value={issueForm.dueDate} onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full" disabled={!issueForm.memberId || !issueForm.bookId}>Issue Book</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader><CardTitle className="font-heading">Issued Books</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead className="hidden sm:table-cell">Issued</TableHead>
                      <TableHead className="hidden sm:table-cell">Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issued.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No issued books</TableCell></TableRow>
                    ) : issued.map((item) => {
                      const member = members.find((m) => m.id === item.memberId);
                      const isOverdue = !item.returnedDate && new Date(item.dueDate) < new Date();
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{member?.name ?? "Unknown"}</TableCell>
                          <TableCell>{item.bookTitle}</TableCell>
                          <TableCell className="hidden sm:table-cell">{item.issuedDate}</TableCell>
                          <TableCell className="hidden sm:table-cell">{item.dueDate}</TableCell>
                          <TableCell>
                            {item.returnedDate ? (
                              <Badge variant="outline">Returned</Badge>
                            ) : isOverdue ? (
                              <Badge variant="destructive">Overdue</Badge>
                            ) : (
                              <Badge variant="default">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {!item.returnedDate && (
                              <Button variant="ghost" size="sm" onClick={() => handleReturn(item.id)}>
                                <RotateCcw className="mr-1 h-4 w-4" /> Return
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MembersSection;
