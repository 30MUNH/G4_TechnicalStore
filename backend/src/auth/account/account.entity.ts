import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { NamedEntity } from "@/common/NamedEntity";
import { Role } from "@/auth/role/role.entity";
import { RefreshToken } from "../jwt/refreshToken.entity";
import { Exclude } from "class-transformer";
import { Order } from "@/order/order.entity";
import { Marketing } from "@/marketing/marketing.entity";
import { SMSNotification } from "@/notification/smsNotification.entity";

@Entity("accounts")
export class Account extends NamedEntity {
  @Column({ nullable: false, unique: true })
  username: string;

  @Exclude()
  @Column({ nullable: false })
  password: string;

  @Column({nullable: true})
  phone: string;

  @Column({ nullable: false, default: false })
  isRegistered: boolean;

  @ManyToOne(() => Role, (role) => role.accounts)
  role: Role;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.account)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Order, (order) => order.shipper)
  shipperOrders: Order[]

  @OneToMany(() => Order, (order) => order.customer)
  customerOrders: Order[];

  @OneToMany(() => Marketing, (marketing) => marketing.account)
  marketingCampaigns: Marketing[];

  @OneToMany(() => SMSNotification, (smsnotification) => smsnotification.account)
  smsNotifications: SMSNotification[];
}