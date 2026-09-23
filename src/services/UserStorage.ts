import type { User } from "../auth/User";
import { users as defaultUsers } from "../auth/users";


const STORAGE_KEY =
  "etiqueta_users";


function cloneDefaultUsers(): User[] {

  return defaultUsers.map(
    user => ({
      ...user
    })
  );

}


export function getUsers(): User[] {

  const stored =
    localStorage.getItem(
      STORAGE_KEY
    );


  if (
    !stored
  ) {

    const initialUsers =
      cloneDefaultUsers();


    saveUsers(
      initialUsers
    );


    return initialUsers;

  }


  try {

    const parsed =
      JSON.parse(
        stored
      );


    if (
      !Array.isArray(
        parsed
      )
    ) {

      return cloneDefaultUsers();

    }


    return parsed as User[];

  }
  catch {

    return cloneDefaultUsers();

  }

}


export function saveUsers(
  users: User[]
) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      users
    )
  );

}


export function findUserByUsername(
  username: string
): User | undefined {

  const normalizedUsername =
    username
      .trim()
      .toLowerCase();


  return getUsers().find(
    user =>
      user.username
        .trim()
        .toLowerCase() ===
          normalizedUsername
  );

}


export function addUser(
  user: User
): User[] {

  const currentUsers =
    getUsers();


  const usernameExists =
    currentUsers.some(
      currentUser =>
        currentUser.username
          .trim()
          .toLowerCase() ===
            user.username
              .trim()
              .toLowerCase()
    );


  if (
    usernameExists
  ) {

    throw new Error(
      "Ya existe un usuario con ese nombre de usuario."
    );

  }


  const updatedUsers = [
    ...currentUsers,
    user
  ];


  saveUsers(
    updatedUsers
  );


  return updatedUsers;

}


export function updateUser(
  user: User
): User[] {

  const currentUsers =
    getUsers();


  const usernameExists =
    currentUsers.some(
      currentUser =>
        currentUser.id !==
          user.id
        &&
        currentUser.username
          .trim()
          .toLowerCase() ===
            user.username
              .trim()
              .toLowerCase()
    );


  if (
    usernameExists
  ) {

    throw new Error(
      "Ya existe otro usuario con ese nombre de usuario."
    );

  }


  const updatedUsers =
    currentUsers.map(
      currentUser =>
        currentUser.id ===
          user.id
          ? user
          : currentUser
    );


  saveUsers(
    updatedUsers
  );


  return updatedUsers;

}


export function setUserActive(
  id: string,
  active: boolean
): User[] {

  const currentUsers =
    getUsers();


  const updatedUsers =
    currentUsers.map(
      user =>
        user.id === id
          ? {
              ...user,
              active
            }
          : user
    );


  saveUsers(
    updatedUsers
  );


  return updatedUsers;

}


export function deleteUser(
  id: string
): User[] {

  const currentUsers =
    getUsers();


  const updatedUsers =
    currentUsers.filter(
      user =>
        user.id !== id
    );


  saveUsers(
    updatedUsers
  );


  return updatedUsers;

}


export function createUserId(): string {

  if (
    typeof crypto !== "undefined"
    &&
    typeof crypto.randomUUID ===
      "function"
  ) {

    return crypto.randomUUID();

  }


  return `user-${Date.now()}`;

}