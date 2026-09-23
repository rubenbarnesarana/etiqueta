import type { User } from "../auth/User";

import {
  supabase
} from "./Supabase";


interface SupabaseUser {

  id: string;

  username: string;

  full_name: string;

  role: "supervisor" | "operator";

  active: boolean;

}


/*
 * Datos necesarios para crear un usuario.
 *
 * La contraseña existe únicamente durante
 * la operación de creación.
 */
export interface CreateUserData {

  id: string;

  username: string;

  password: string;

  fullName: string;

  role: "supervisor" | "operator";

  active: boolean;

}


/*
 * Datos necesarios para actualizar un usuario.
 *
 * password vacío = mantener la contraseña actual.
 */
export interface UpdateUserData {

  id: string;

  username: string;

  password?: string;

  fullName: string;

  role: "supervisor" | "operator";

  active: boolean;

}


function mapSupabaseUser(
  user: SupabaseUser
): User {

  return {

    id:
      user.id,

    username:
      user.username,

    fullName:
      user.full_name,

    role:
      user.role,

    active:
      user.active

  };

}


/*
 * ==================================================
 * OBTENER USUARIOS
 * ==================================================
 */

export async function getSupabaseUsers(): Promise<User[]> {

  const {
    data,
    error
  } =
    await supabase
      .from(
        "app_users"
      )
      .select(
        "id, username, full_name, role, active"
      )
      .order(
        "full_name",
        {
          ascending: true
        }
      );


  if (
    error
  ) {

    throw new Error(
      `No se pudieron cargar los usuarios: ${error.message}`
    );

  }


  return (
    data ?? []
  ).map(
    user =>
      mapSupabaseUser(
        user as SupabaseUser
      )
  );

}


/*
 * ==================================================
 * LOGIN SEGURO
 * ==================================================
 */

export async function loginSupabaseUser(
  username: string,
  password: string
): Promise<User | null> {

  const {
    data,
    error
  } =
    await supabase.rpc(
      "login_app_user",
      {
        p_username:
          username,

        p_password:
          password
      }
    );


  if (
    error
  ) {

    throw new Error(
      `No se pudo iniciar sesión: ${error.message}`
    );

  }


  if (
    !data
    ||
    data.length === 0
  ) {

    return null;

  }


  const found =
    data[0];


  return {

    id:
      found.id,

    username:
      found.username,

    fullName:
      found.full_name,

    role:
      found.role,

    active:
      found.active

  };

}


/*
 * ==================================================
 * CREAR USUARIO
 * ==================================================
 */

export async function addSupabaseUser(
  user: CreateUserData
): Promise<User> {

  const {
    error
  } =
    await supabase.rpc(
      "create_app_user",
      {
        p_id:
          user.id,

        p_username:
          user.username,

        p_password:
          user.password,

        p_full_name:
          user.fullName,

        p_role:
          user.role,

        p_active:
          user.active
      }
    );


  if (
    error
  ) {

    throw new Error(
      `No se pudo crear el usuario: ${error.message}`
    );

  }


  /*
   * Devolvemos un User normal.
   * La contraseña no forma parte del usuario.
   */
  return {

    id:
      user.id,

    username:
      user.username,

    fullName:
      user.fullName,

    role:
      user.role,

    active:
      user.active

  };

}


/*
 * ==================================================
 * ACTUALIZAR USUARIO
 * ==================================================
 */

export async function updateSupabaseUser(
  user: UpdateUserData
): Promise<User> {

  const {
    error
  } =
    await supabase.rpc(
      "update_app_user",
      {
        p_id:
          user.id,

        p_username:
          user.username,

        /*
         * Vacío = mantener la contraseña actual.
         */
        p_password:
          user.password?.trim()
            ? user.password
            : null,

        p_full_name:
          user.fullName,

        p_role:
          user.role,

        p_active:
          user.active
      }
    );


  if (
    error
  ) {

    throw new Error(
      `No se pudo actualizar el usuario: ${error.message}`
    );

  }


  /*
   * Devolvemos únicamente los datos públicos
   * del usuario.
   */
  return {

    id:
      user.id,

    username:
      user.username,

    fullName:
      user.fullName,

    role:
      user.role,

    active:
      user.active

  };

}


/*
 * ==================================================
 * ACTIVAR / DESACTIVAR USUARIO
 * ==================================================
 */

export async function setSupabaseUserActive(
  id: string,
  active: boolean
): Promise<void> {

  const {
    error
  } =
    await supabase
      .from(
        "app_users"
      )
      .update({

        active

      })
      .eq(
        "id",
        id
      );


  if (
    error
  ) {

    throw new Error(
      `No se pudo cambiar el estado del usuario: ${error.message}`
    );

  }

}


/*
 * ==================================================
 * BORRAR USUARIO
 * ==================================================
 */

export async function deleteSupabaseUser(
  id: string
): Promise<void> {

  const {
    error
  } =
    await supabase
      .from(
        "app_users"
      )
      .delete()
      .eq(
        "id",
        id
      );


  if (
    error
  ) {

    throw new Error(
      `No se pudo borrar el usuario: ${error.message}`
    );

  }

}