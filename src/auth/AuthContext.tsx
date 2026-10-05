import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

import type {
  ReactNode
} from "react";

import type {
  User
} from "./User";

import {
  acquireSupabaseUserSession,
  loginSupabaseUser,
  releaseSupabaseUserSession,
  releaseSupabaseUserSessionOnClose,
  touchSupabaseUserSession
} from "../services/SupabaseUserService";


export type LoginResult =
  | "success"
  | "invalid_credentials"
  | "session_active"
  | "server_error";


interface AuthContextType {

  user: User | null;

  login: (
    username: string,
    password: string
  ) => Promise<LoginResult>;

  logout: () => void;

}


const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );


interface Props {

  children: ReactNode;

}


const SESSION_TOKEN_KEY =
  "rivulisAppSessionToken";


const SESSION_USER_KEY =
  "rivulisAppSessionUserId";


const SESSION_HEARTBEAT_MS =
  60 * 1000;


/*
 * ==================================================
 * GENERAR TOKEN
 * ==================================================
 */

function createSessionToken():
  string {

  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {

    return crypto.randomUUID();

  }


  return (
    `${Date.now()}-` +
    Math.random()
      .toString(36)
      .slice(2) +
    "-" +
    Math.random()
      .toString(36)
      .slice(2)
  );

}


/*
 * ==================================================
 * AUTH PROVIDER
 * ==================================================
 */

export function AuthProvider({

  children

}: Props) {


  const [
    user,
    setUser
  ] = useState<User | null>(
    null
  );


  const closingSessionRef =
    useRef(
      false
    );


  /*
   * ==================================================
   * LOGIN
   * ==================================================
   */

  async function login(
    username: string,
    password: string
  ): Promise<LoginResult> {

    try {

      const found =
        await loginSupabaseUser(
          username,
          password
        );


      if (
        !found
      ) {

        return "invalid_credentials";

      }


      const storedUserId =
        sessionStorage.getItem(
          SESSION_USER_KEY
        );


      const storedToken =
        sessionStorage.getItem(
          SESSION_TOKEN_KEY
        );


      const sessionToken =
        storedUserId ===
          found.id &&
        storedToken
          ? storedToken
          : createSessionToken();


      const acquired =
        await acquireSupabaseUserSession(
          found.id,
          sessionToken
        );


      if (
        !acquired
      ) {

        return "session_active";

      }


      sessionStorage.setItem(
        SESSION_TOKEN_KEY,
        sessionToken
      );


      sessionStorage.setItem(
        SESSION_USER_KEY,
        found.id
      );


      closingSessionRef.current =
        false;


      setUser(
        found
      );


      return "success";

    }
    catch (
      error
    ) {

      console.error(
        "Error iniciando sesión:",
        error
      );


      return "server_error";

    }

  }


  /*
   * ==================================================
   * HEARTBEAT
   * ==================================================
   */

  useEffect(
    () => {

      if (
        !user
      ) {

        return;

      }


      let disposed =
        false;


      async function heartbeat() {

        const sessionToken =
          sessionStorage.getItem(
            SESSION_TOKEN_KEY
          );


        const sessionUserId =
          sessionStorage.getItem(
            SESSION_USER_KEY
          );


        if (
          !sessionToken ||
          sessionUserId !== user.id
        ) {

          if (
            !disposed
          ) {

            setUser(
              null
            );

          }


          return;

        }


        try {

          const valid =
            await touchSupabaseUserSession(
              user.id,
              sessionToken
            );


          if (
            !valid &&
            !disposed
          ) {

            sessionStorage.removeItem(
              SESSION_TOKEN_KEY
            );


            sessionStorage.removeItem(
              SESSION_USER_KEY
            );


            setUser(
              null
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error actualizando la sesión:",
            error
          );

        }

      }


      void heartbeat();


      const interval =
        window.setInterval(
          () => {

            void heartbeat();

          },
          SESSION_HEARTBEAT_MS
        );


      return () => {

        disposed =
          true;


        window.clearInterval(
          interval
        );

      };

    },
    [
      user
    ]
  );


  /*
   * ==================================================
   * CERRAR SESIÓN AL CERRAR PESTAÑA / VENTANA
   * ==================================================
   */

  useEffect(
    () => {

      if (
        !user
      ) {

        return;

      }


      function closeBrowserSession() {

        if (
          closingSessionRef.current
        ) {

          return;

        }


        const sessionToken =
          sessionStorage.getItem(
            SESSION_TOKEN_KEY
          );


        const sessionUserId =
          sessionStorage.getItem(
            SESSION_USER_KEY
          );


        if (
          !sessionToken ||
          sessionUserId !== user.id
        ) {

          return;

        }


        closingSessionRef.current =
          true;


        /*
         * Esta función utiliza fetch keepalive.
         *
         * Es distinta del logout normal porque
         * el navegador puede estar cerrando la página.
         */

        releaseSupabaseUserSessionOnClose(
          user.id,
          sessionToken
        );


        sessionStorage.removeItem(
          SESSION_TOKEN_KEY
        );


        sessionStorage.removeItem(
          SESSION_USER_KEY
        );

      }


      window.addEventListener(
        "pagehide",
        closeBrowserSession
      );


      window.addEventListener(
        "beforeunload",
        closeBrowserSession
      );


      return () => {

        window.removeEventListener(
          "pagehide",
          closeBrowserSession
        );


        window.removeEventListener(
          "beforeunload",
          closeBrowserSession
        );

      };

    },
    [
      user
    ]
  );


  /*
   * ==================================================
   * LOGOUT MANUAL
   * ==================================================
   */

  function logout() {

    const currentUser =
      user;


    const sessionToken =
      sessionStorage.getItem(
        SESSION_TOKEN_KEY
      );


    const sessionUserId =
      sessionStorage.getItem(
        SESSION_USER_KEY
      );


    /*
     * Cerramos inmediatamente
     * la aplicación en pantalla.
     */

    setUser(
      null
    );


    closingSessionRef.current =
      true;


    sessionStorage.removeItem(
      SESSION_TOKEN_KEY
    );


    sessionStorage.removeItem(
      SESSION_USER_KEY
    );


    /*
     * Al pulsar el botón sí podemos utilizar
     * la llamada normal y esperar que Supabase
     * procese la liberación.
     */

    if (
      currentUser &&
      sessionToken &&
      sessionUserId ===
        currentUser.id
    ) {

      void releaseSupabaseUserSession(
        currentUser.id,
        sessionToken
      )
        .catch(
          error => {

            console.error(
              "Error cerrando sesión en Supabase:",
              error
            );

          }
        );

    }

  }


  /*
   * ==================================================
   * PROVIDER
   * ==================================================
   */

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


/*
 * ==================================================
 * HOOK
 * ==================================================
 */

export function useAuth() {

  return useContext(
    AuthContext
  );

}