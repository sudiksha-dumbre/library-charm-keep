export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  year: number;
  copies: number;
  available: number;
  addedAt: string;
}

const STORAGE_KEY = "library_books";

const SEED_BOOKS: Book[] = [
  { id: "1", title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0061120084", genre: "Fiction", year: 1960, copies: 5, available: 3, addedAt: new Date().toISOString() },
  { id: "2", title: "1984", author: "George Orwell", isbn: "978-0451524935", genre: "Dystopian", year: 1949, copies: 4, available: 2, addedAt: new Date().toISOString() },
  { id: "3", title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0743273565", genre: "Fiction", year: 1925, copies: 3, available: 3, addedAt: new Date().toISOString() },
  { id: "4", title: "Pride and Prejudice", author: "Jane Austen", isbn: "978-0141439518", genre: "Romance", year: 1813, copies: 6, available: 4, addedAt: new Date().toISOString() },
  { id: "5", title: "The Catcher in the Rye", author: "J.D. Salinger", isbn: "978-0316769488", genre: "Fiction", year: 1951, copies: 3, available: 1, addedAt: new Date().toISOString() },
];

export function getBooks(): Book[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BOOKS));
    return SEED_BOOKS;
  }
  return JSON.parse(stored);
}

export function saveBooks(books: Book[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

export function addBook(book: Omit<Book, "id" | "addedAt">): Book {
  const books = getBooks();
  const newBook: Book = { ...book, id: crypto.randomUUID(), addedAt: new Date().toISOString() };
  books.push(newBook);
  saveBooks(books);
  return newBook;
}

export function updateBook(id: string, updates: Partial<Omit<Book, "id" | "addedAt">>): Book | null {
  const books = getBooks();
  const idx = books.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  books[idx] = { ...books[idx], ...updates };
  saveBooks(books);
  return books[idx];
}

export function deleteBook(id: string): boolean {
  const books = getBooks();
  const filtered = books.filter((b) => b.id !== id);
  if (filtered.length === books.length) return false;
  saveBooks(filtered);
  return true;
}
