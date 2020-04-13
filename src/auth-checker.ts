import { AuthChecker } from "type-graphql";

export const customAuthChecker: AuthChecker<{ uid: string}> = (
  { root, args, context, info },
  roles
) => {
  if (!roles.length) {
    return !!context.uid;
  }

  // here we can read the user from context
  // and check his permission in the db against the `roles` argument
  // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]
  console.log('root', root)
  console.log('args', args)
  console.log('context', context)
  console.log('info', info)
  console.log('roles', roles)

  return true; // or false if access is denied
};