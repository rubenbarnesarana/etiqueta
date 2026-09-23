import type { User } from "./User";

export const users: User[] = [

  {
    id: "admin",
    username: "admin",
    password: "admin",
    fullName: "Supervisor",
    role: "supervisor",
    active: true
  },

  {
    id: "operario",
    username: "operario",
    password: "1234",
    fullName: "Operario",
    role: "operator",
    active: true
  }

];