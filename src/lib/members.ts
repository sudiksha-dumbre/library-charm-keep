export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
}

export interface IssuedBook {
  id: string;
  memberId: string;
  bookId: string;
  bookTitle: string;
  issuedDate: string;
  dueDate: string;
  returnedDate: string | null;
}

const MEMBERS_KEY = "library_members";
const ISSUED_KEY = "library_issued";

const SEED_MEMBERS: Member[] = [
  { id: "m1", name: "Alice Johnson", email: "alice@example.com", phone: "555-0101", memberSince: "2024-01-15" },
  { id: "m2", name: "Bob Smith", email: "bob@example.com", phone: "555-0102", memberSince: "2024-02-20" },
  { id: "m3", name: "Carol Davis", email: "carol@example.com", phone: "555-0103", memberSince: "2024-03-10" },
  { id: "m4", name: "David Wilson", email: "david@example.com", phone: "555-0104", memberSince: "2024-04-05" },
  { id: "m5", name: "Eva Martinez", email: "eva@example.com", phone: "555-0105", memberSince: "2024-05-12" },
];

const SEED_ISSUED: IssuedBook[] = [
  { id: "i1", memberId: "m1", bookId: "1", bookTitle: "To Kill a Mockingbird", issuedDate: "2026-03-20", dueDate: "2026-04-20", returnedDate: null },
  { id: "i2", memberId: "m2", bookId: "2", bookTitle: "1984", issuedDate: "2026-03-15", dueDate: "2026-04-15", returnedDate: null },
  { id: "i3", memberId: "m3", bookId: "5", bookTitle: "The Catcher in the Rye", issuedDate: "2026-03-10", dueDate: "2026-04-10", returnedDate: "2026-03-28" },
  { id: "i4", memberId: "m1", bookId: "4", bookTitle: "Pride and Prejudice", issuedDate: "2026-03-25", dueDate: "2026-04-25", returnedDate: null },
  { id: "i5", memberId: "m4", bookId: "2", bookTitle: "1984", issuedDate: "2026-02-01", dueDate: "2026-03-01", returnedDate: "2026-02-28" },
];

export function getMembers(): Member[] {
  const stored = localStorage.getItem(MEMBERS_KEY);
  if (!stored) {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(SEED_MEMBERS));
    return SEED_MEMBERS;
  }
  return JSON.parse(stored);
}

export function getIssuedBooks(): IssuedBook[] {
  const stored = localStorage.getItem(ISSUED_KEY);
  if (!stored) {
    localStorage.setItem(ISSUED_KEY, JSON.stringify(SEED_ISSUED));
    return SEED_ISSUED;
  }
  return JSON.parse(stored);
}

export function saveMembers(members: Member[]) {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

export function saveIssuedBooks(issued: IssuedBook[]) {
  localStorage.setItem(ISSUED_KEY, JSON.stringify(issued));
}

export function addMember(member: Omit<Member, "id">): Member {
  const members = getMembers();
  const newMember: Member = { ...member, id: crypto.randomUUID() };
  members.push(newMember);
  saveMembers(members);
  return newMember;
}

export function issueBook(data: Omit<IssuedBook, "id" | "returnedDate">): IssuedBook {
  const issued = getIssuedBooks();
  const newIssue: IssuedBook = { ...data, id: crypto.randomUUID(), returnedDate: null };
  issued.push(newIssue);
  saveIssuedBooks(issued);
  return newIssue;
}

export function returnBook(issueId: string): boolean {
  const issued = getIssuedBooks();
  const idx = issued.findIndex((i) => i.id === issueId);
  if (idx === -1) return false;
  issued[idx].returnedDate = new Date().toISOString().split("T")[0];
  saveIssuedBooks(issued);
  return true;
}
