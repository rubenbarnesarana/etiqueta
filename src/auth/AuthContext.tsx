import {
  createContext,
  useContext,
  useState
} from "react";

import type { ReactNode } from "react";
import type { User } from "./User";

import {
  loginSupabaseUser
} from "../services/SupabaseUserService";


interface AuthContextType {

  user: User | null;

  login: (
    username: string,
    password: string
  ) => Promise<boolean>;

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


  const [
    user,
    setUser
  ] = useState<User | null>(
    null
  );


  async function login(

    username: string,

    password: string

  ): Promise<boolean> {


    try {

      const found =
        await loginSupabaseUser(
          username,
          password
        );


      if (
        !found
      ) {

        return false;

      }


      setUser(
        found
      );


      return true;

    }
    catch (
      error
    ) {

      console.error(
        "Error iniciando sesión:",
        error
      );


      return false;

    }

  }


  function logout() {

    setUser(
      null
    );

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

  return useContext(
    AuthContext
  );

}