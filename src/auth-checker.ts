import { AuthChecker } from "type-graphql";
import { getConnection } from "typeorm";
import { User } from "./models/User";
import { Role } from "./models/Role.enum";

export enum ROLES {
  ADMIN = "ADMIN",
  SAME_USER = "SAME_USER"
}

export const customAuthChecker: AuthChecker<{ uid: string}> = async (
  { root, args, context, info },
  roles
) => {
  if (!roles.length) {
    return !!context.uid;
  }

  const user = await getConnection().getRepository(User).findOne({ id: context.uid })
  const hasAccess = roles.some((role) => determineAccess(user, role, context, args));

  return hasAccess;
};

function determineAccess(user: User | undefined, role: string, context: any, args: any) {
  switch(role) {
    case ROLES.SAME_USER:
      return context.uid === args.data.user;

    case ROLES.ADMIN:
      return user && user.role === Role.ADMIN;

    default:
      return false;
  }
}