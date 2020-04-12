import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

import { Challenge } from "../Challenge";
import { UserExercise } from "../UserExercise";
import { MuscleGroup } from "../MuscleGroup.enum";

@Entity()
@ObjectType()
export class Exercise extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => String)
  @Column()
  title: string

  @Field(() => MuscleGroup)
  @Column()
  muscleGroup: MuscleGroup

  @OneToMany(
    type => Challenge,
    challenge => challenge.exercise
  )
  challenges: Challenge[]

  @OneToMany(
    type => UserExercise,
    userExercise => userExercise.exercise
  )
  userExercises: UserExercise[]
}
