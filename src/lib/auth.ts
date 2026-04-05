export interface User {
  email: string;
  name: string;
  role: "admin" | "librarian";
}

const DEMO_ACCOUNTS: { email: string; password: string; user: User }[] = [
  {
    email: "admin@library.com",
    password: "admin123",
    user: { email: "admin@library.com", name: "Admin User", role: "admin" },
  },
  {
    email: "librarian@library.com",
    password: "lib123",
    user: { email: "librarian@library.com", name: "Librarian User", role: "librarian" },
  },
];

export function login(email: string, password: string): User | null {
  const account = DEMO_ACCOUNTS.find(
    (a) => a.email === email && a.password === password
  );
  if (account) {
    localStorage.setItem("library_user", JSON.stringify(account.user));
    return account.user;
  }
  return null;
}

export function logout() {
  localStorage.removeItem("library_user");
}

export function getCurrentUser(): User | null {
  const stored = localStorage.getItem("library_user");
  return stored ? JSON.parse(stored) : null;
}
