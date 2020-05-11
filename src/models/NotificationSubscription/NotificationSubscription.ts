import { Entity, BaseEntity, PrimaryGeneratedColumn, OneToOne, Column, JoinColumn } from "typeorm";
import { ObjectType, ID, Field } from "type-graphql";
import { User } from "../User";

@Entity()
@ObjectType()
export class NotificationSubscription extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => String)
  @Column()
  notification: string;

  @OneToOne(
    type => User,
    user => user.subscription
  )
  @JoinColumn()
  user: User;
}