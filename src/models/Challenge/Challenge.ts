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

  @Field(() => Date)
  @Column()
  createdAt: Date

  @Field(() => Date)
  @Column()
  expiresAt: Date

  @OneToMany(
    type => ChallengeResponse,
    response => response.challenge,
    {
      cascade: true
    }
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