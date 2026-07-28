import {
  createContext,
  useContext,
  useState
} from "react";

import type { ReactNode } from "react";
import type { User } from "./User";

import { users } from "./users";

interface AuthContextType {

  user: User | null;

  login: (
    username: string,
    password: string
  ) => boolean;

  logout: () => void;

}

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

interface Props {

  children: ReactNode;

}

export function AuthProvider({

  children

}: Props) {

  const [user, setUser] = useState<User | null>(null);

  function login(

    username: string,

    password: string

  ): boolean {

    const found = users.find(

      u =>

        u.username.toLowerCase() === username.toLowerCase()

        &&

        u.password === password

    );

    if (!found) {

      return false;

    }

    setUser(found);

    return true;

  }

  function logout() {

    setUser(null);

  }

  return (

    <AuthContext.Provider

      value={{

        user,

        login,

        logout

      }}

    >

      {children}

    </AuthContext.Provider>

  );

}

export function useAuth() {

  return useContext(AuthContext);

}