import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "@/lib/auth";
import { getBooks, addBook, updateBook, deleteBook, type Book } from "@/lib/books";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Search, LogOut, Pencil, Trash2, Library, Users, BookCopy, ArrowRightLeft } from "lucide-react";
import MembersSection from "@/components/MembersSection";
import TransactionsSection from "@/components/TransactionsSection";
import { addTransaction } from "@/lib/transactions";
import { toast } from "sonner";

const TAB_KEY = "library_active_tab";
const emptyForm = { title: "", author: "", isbn: "", genre: "", year: new Date().getFullYear(), copies: 1, available: 1 };

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    setBooks(getBooks());
  }, []);

  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn.includes(search)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      updateBook(editingBook.id, form);
      addTransaction({ type: "book_updated", description: `Updated book details`, bookTitle: form.title });
      toast.success("Book updated successfully");
    } else {
      addBook(form);
      addTransaction({ type: "book_added", description: `New book added to collection`, bookTitle: form.title });
      toast.success("Book added successfully");
    }
    setBooks(getBooks());
    setDialogOpen(false);
    setEditingBook(null);
    setForm(emptyForm);
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setForm({ title: book.title, author: book.author, isbn: book.isbn, genre: book.genre, year: book.year, copies: book.copies, available: book.available });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const book = books.find((b) => b.id === id);
    deleteBook(id);
    if (book) addTransaction({ type: "book_deleted", description: `Book removed from collection`, bookTitle: book.title });
    setBooks(getBooks());
    toast.success("Book deleted");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem(TAB_KEY, value);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const totalBooks = books.reduce((s, b) => s + b.copies, 0);
  const totalAvailable = books.reduce((s, b) => s + b.available, 0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">Library Manager</h1>
              <p className="text-xs text-muted-foreground">Welcome, {user.name} ({user.role})</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 animate-fade-in">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Library className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Titles</p>
                <p className="text-2xl font-bold text-foreground">{books.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                <BookCopy className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Copies</p>
                <p className="text-2xl font-bold text-foreground">{totalBooks}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-foreground">{totalAvailable}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="members">Members & Issues</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search books..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingBook(null); setForm(emptyForm); } }}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Add Book</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-heading">{editingBook ? "Edit Book" : "Add New Book"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="grid gap-4 pt-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2"><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Author</Label><Input required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2"><Label>ISBN</Label><Input required value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Genre</Label><Input required value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} /></div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2"><Label>Year</Label><Input type="number" required value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} /></div>
                      <div className="space-y-2"><Label>Total Copies</Label><Input type="number" min={1} required value={form.copies} onChange={(e) => setForm({ ...form, copies: Number(e.target.value) })} /></div>
                      <div className="space-y-2"><Label>Available</Label><Input type="number" min={0} required value={form.available} onChange={(e) => setForm({ ...form, available: Number(e.target.value) })} /></div>
                    </div>
                    <Button type="submit" className="mt-2">{editingBook ? "Update Book" : "Add Book"}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Table */}
            <Card className="animate-fade-in">
              <CardHeader><CardTitle className="font-heading">Book Collection</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead className="hidden md:table-cell">ISBN</TableHead>
                        <TableHead className="hidden sm:table-cell">Genre</TableHead>
                        <TableHead className="hidden sm:table-cell">Year</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No books found</TableCell></TableRow>
                      ) : filtered.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">{book.title}</TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell className="hidden md:table-cell font-mono text-xs">{book.isbn}</TableCell>
                          <TableCell className="hidden sm:table-cell"><Badge variant="secondary">{book.genre}</Badge></TableCell>
                          <TableCell className="hidden sm:table-cell">{book.year}</TableCell>
                          <TableCell><Badge variant={book.available > 0 ? "default" : "destructive"}>{book.available}/{book.copies}</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(book)}><Pencil className="h-4 w-4" /></Button>
                              {user?.role === "admin" && (
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(book.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <MembersSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
