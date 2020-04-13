import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

import { User } from "../User/User";
import { Exercise } from "../Exercise";

@Entity()
@ObjectType()
export class UserExercise extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field()
  @Column()
  reps: number

  @ManyToOne(
    type => User,
    user => user.exercises
  )
  user: User

  @ManyToOne(
    type => Exercise,
    exercise => exercise.userExercises
  )
  exercise: Exercise
}