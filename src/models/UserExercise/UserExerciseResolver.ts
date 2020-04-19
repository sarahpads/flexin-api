import { Resolver, Query, Mutation, Arg, FieldResolver, Root, Ctx } from "type-graphql";
import { UserExercise } from "./UserExercise";
import { CreateUserExerciseInput } from "./CreateUserExerciseInput";
import { getRepository, Repository, createQueryBuilder } from "typeorm";
import { Exercise } from "../Exercise";
import { User } from "../User/User";

@Resolver(of => UserExercise)
export class UserExerciseResolver {
  constructor() { }

  @Query(() => [UserExercise])
  userExercises() {
    return UserExercise.find()
  }

  @Query(() => UserExercise)
  async userExercise(@Arg("id") id: string) {
    const userExercise = await UserExercise.findOne({ where: { id } });

    if (!userExercise) {
      throw new Error("UserExercise not found");
    }

    return userExercise;
  }

  @FieldResolver(() => User)
  async user(@Root() userExercise: UserExercise) {
    const user = await UserExercise.createQueryBuilder()
      .relation(UserExercise, "user")
      .of(userExercise)
      .loadOne()

    return user;
  }


  @FieldResolver(returns => Exercise)
  async exercise(@Root() userExercise: UserExercise) {
    const exercise = await UserExercise.createQueryBuilder()
      .relation(UserExercise, "exercise")
      .of(userExercise)
      .loadOne()

    return exercise;
  }

  @Mutation(() => UserExercise)
  async createUserExercise(@Arg("data") data: CreateUserExerciseInput) {
    const exerciseRepository = getRepository(Exercise)
    const exercise = await exerciseRepository.findOne({ where: { id: data.exercise } });

    const userRepository = getRepository(User);
    // TODO: ensure randos can't create for other users?
    const user = await userRepository.findOne({ where: { id: data.user } });
    console.log(user)

    const userExercise = await UserExercise.insert({
      reps: data.reps,
      exercise,
      user
    });

    return userExercise;
  }
}