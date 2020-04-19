import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

import { ChallengeResponse } from "../ChallengeResponse";
import { User } from "../User";
import { Exercise } from "../Exercise";

@Entity()
@ObjectType()
export class Challenge extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => Number)
  @Column()
  reps: number

  @Field(() => Date)
  @Column()
  date: Date

  @Field(() => Date)
  @Column()
  expiresAt: Date

  @OneToMany(
    type => ChallengeResponse,
    response => response.challenge
  )
  responses: ChallengeResponse[]

  @ManyToOne(
    type => User,
    user => user.challenges
  )
  user: User

  @ManyToOne(
    type => Exercise,
    exercise => exercise.challenges
  )
  exercise: Exercise
}