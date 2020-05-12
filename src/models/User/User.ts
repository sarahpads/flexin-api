import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, PrimaryColumn, JoinTable, JoinColumn, OneToOne } from "typeorm";
import { ObjectType, Field, ID, Authorized } from "type-graphql";

import { Challenge } from "../Challenge";
import { ChallengeResponse } from "../ChallengeResponse";
import { UserExercise } from "../UserExercise";
import { Role } from "../Role.enum";
import { NotificationSubscription } from "../NotificationSubscription";

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryColumn()
  id: string;

  @Field(() => String)
  @Column()
  email: string;

  @Field(() => String)
  @Column()
  name: string;

  @Authorized([Role.ADMIN])
  @Field(() => Role)
  @Column({ nullable: true })
  role: Role;

  @Authorized([Role.USER])
  @OneToOne(
    type => NotificationSubscription,
    subscription => subscription.user
  )
  subscription: NotificationSubscription;

  @OneToMany(
    type => Challenge,
    challenge => challenge.user
  )
  challenges: Challenge[];

  @OneToMany(
    type => ChallengeResponse,
    challengeResponse => challengeResponse.user
  )
  challengeResponses: ChallengeResponse[]

  @OneToMany(
    type => UserExercise,
    userExercise => userExercise.user,
    {
      cascade: true
    }
  )
  @JoinColumn()
  exercises: UserExercise[]
}
