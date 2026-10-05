import {
  createContext,
  useContext,
  useEffect,
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


/*
 * ==================================================
 * DATOS DE SESIÓN LOCAL
 * ==================================================
 */

const SESSION_TOKEN_KEY =
  "rivulisAppSessionToken";


const SESSION_USER_KEY =
  "rivulisAppSessionUserId";


/*
 * Heartbeat cada minuto.
 *
 * En Supabase una sesión se considera abandonada
 * después de 3 minutos sin heartbeat.
 */
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

      /*
       * Primero comprobamos usuario y contraseña.
       */

      const found =
        await loginSupabaseUser(
          username,
          password
        );


      /*
       * Credenciales incorrectas.
       */

      if (
        !found
      ) {

        return "invalid_credentials";

      }


      /*
       * ==================================================
       * TOKEN DEL NAVEGADOR
       * ==================================================
       */

      const storedUserId =
        sessionStorage.getItem(
          SESSION_USER_KEY
        );


      const storedToken =
        sessionStorage.getItem(
          SESSION_TOKEN_KEY
        );


      /*
       * Si este mismo navegador ya tenía un token
       * para este usuario, lo reutilizamos.
       *
       * Esto evita que una recarga de página
       * pueda bloquear la propia sesión.
       */

      const sessionToken =
        storedUserId ===
          found.id &&
        storedToken
          ? storedToken
          : createSessionToken();


      /*
       * ==================================================
       * RESERVAR SESIÓN EN SUPABASE
       * ==================================================
       */

      const acquired =
        await acquireSupabaseUserSession(
          found.id,
          sessionToken
        );


      /*
       * El usuario ya está conectado
       * desde otro ordenador/navegador.
       */

      if (
        !acquired
      ) {

        return "session_active";

      }


      /*
       * Guardamos el token únicamente
       * durante esta sesión del navegador.
       */

      sessionStorage.setItem(
        SESSION_TOKEN_KEY,
        sessionToken
      );


      sessionStorage.setItem(
        SESSION_USER_KEY,
        found.id
      );


      /*
       * Login correcto.
       */

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


        /*
         * Si faltan los datos de sesión locales,
         * cerramos la sesión del programa.
         */

        if (
          !sessionToken ||
          sessionUserId !== user?.id
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


          /*
           * Si la sesión ha dejado de ser válida,
           * cerramos este usuario localmente.
           */

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

          /*
           * Un fallo temporal de conexión
           * no expulsa inmediatamente al usuario.
           */

          console.error(
            "Error actualizando la sesión:",
            error
          );

        }

      }


      /*
       * Heartbeat inmediato.
       */

      void heartbeat();


      /*
       * Después cada minuto.
       */

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
   * LOGOUT
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
     * la sesión en pantalla.
     */

    setUser(
      null
    );


    /*
     * Eliminamos los datos locales.
     */

    sessionStorage.removeItem(
      SESSION_TOKEN_KEY
    );


    sessionStorage.removeItem(
      SESSION_USER_KEY
    );


    /*
     * Liberamos la sesión de Supabase.
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