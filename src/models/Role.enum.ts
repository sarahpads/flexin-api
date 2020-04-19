import { registerEnumType } from "type-graphql";

export enum Role {
  ADMIN = "admin"
}

registerEnumType(Role, {
  name: "Role"
});
