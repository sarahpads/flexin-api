import { Resolver, Query, Mutation, Arg, FieldResolver, Root, Ctx } from "type-graphql";
import { UserExercise } from "./UserExercise";
import { CreateUserExerciseInput } from "./CreateUserExerciseInput";
import { getRepository, Repository, createQueryBuilder } from "typeorm";
import { Exercise } from "../Exercise";
import { User } from "../User/User";

@Resolver(of => UserExercise)
export class UserExerciseResolver {
  constructor(
    private exerciseRepository: Repository<User>
  ) {}

  @Query(() => [UserExercise])
  userExercises() {
    return UserExercise.find()
  }

  @Query(() => UserExercise)
  async user(@Arg("id") id: string) {
    const userExercise = await UserExercise.findOne({ where: { id } });

    if (!userExercise) {
      throw new Error("UserExercise not found");
    }

    return userExercise;
  }

  @FieldResolver(returns => Exercise)
  async exercise(@Root() { id }: UserExercise) {
    const userExercise = await UserExercise.createQueryBuilder("userExercise")
      .where("userExercise.id = :id", { id })
      .leftJoinAndSelect("userExercise.exercise", "exercise")
      .getOne()

    if (!userExercise) {
      throw new Error("UserExercise not found");
    }

    return userExercise.exercise;
  }

  @Mutation(() => UserExercise)
  async createUserExercise(@Arg("data") data: CreateUserExerciseInput) {
    const exerciseRepository = getRepository(Exercise)
    const exercise = await exerciseRepository.findOne({ where: { id: data.exercise } });

    const userRepository = getRepository(User);
    // TODO: ensure randos can't create for other users?
    const user = await userRepository.findOne({ where: { id: data.user } });

    const userExercise = UserExercise.create({
      reps: data.reps,
      exercise,
      user
    });

    await userExercise.save();

    return userExercise;
  }
}