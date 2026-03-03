import React, { createContext, useState, useContext } from 'react';

export type User = {
  id: number;
  nom: string;
  email?: string;
  telephone?: string;
};

const UserContext = createContext<{
  user: User;
  setUser: (user: User) => void;
  users: User[];
  switchUser: (userId: number) => void;
}>({
  user: { id: 1, nom: "Sophie Martin" },
  setUser: () => {},
  users: [],
  switchUser: () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  // Liste des utilisateurs disponibles pour les tests
  const [users] = useState<User[]>([
    { id: 1, nom: "Sophie Martin", email: "sophie@test.com", telephone: "77 123 45 67" },
    { id: 2, nom: "Marie Diop", email: "marie@test.com", telephone: "78 234 56 78" },
    { id: 3, nom: "Claire Ndiaye", email: "claire@test.com", telephone: "76 345 67 89" },
    { id: 4, nom: "Anta  Fall", email: "amina@test.com", telephone: "70 456 78 90" },
  ]);

  const [user, setUser] = useState<User>(users[0]);

  const switchUser = (userId: number) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setUser(selectedUser);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, users, switchUser }}>
      {children}
    </UserContext.Provider>
  );
};