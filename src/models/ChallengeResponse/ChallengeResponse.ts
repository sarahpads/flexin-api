import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

import { Challenge } from "../Challenge/Challenge";
import { User } from "../User";

@Entity()
@ObjectType()
export class ChallengeResponse extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => Number)
  @Column()
  reps: number;

  /*@Field(() => Date)
  @Column()
  date: Date;*/

  @ManyToOne(
    type => Challenge,
    challenge => challenge.responses
  )
  challenge: Challenge

  @ManyToOne(
    type => User,
    user => user.challengeResponses
  )
  user: User
}
