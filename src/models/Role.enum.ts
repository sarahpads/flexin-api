import { registerEnumType } from "type-graphql";

export enum Role {
  ADMIN = "admin",
  USER = "user"
}

registerEnumType(Role, {
  name: "Role"
});
