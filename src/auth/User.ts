export interface User {

  id: string;

  username: string;

  fullName: string;

  role: "supervisor" | "operator";

  active: boolean;

}