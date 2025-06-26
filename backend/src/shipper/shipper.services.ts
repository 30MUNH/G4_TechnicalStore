import { Service } from "typedi";
import { Account } from "@/auth/account/account.entity";
import { Role } from "@/auth/role/role.entity";
import { CreateShipperDto, UpdateShipperDto } from "./dtos/shipper.dtos";
import { EntityNotFoundException } from "@/exceptions/http-exceptions";
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 8;

@Service()
export class ShipperService {
  async createShipper(createShipperDto: CreateShipperDto): Promise<Account> {
    // Kiểm tra username đã tồn tại chưa
    const existingAccount = await Account.findOne({ 
      where: { username: createShipperDto.username } 
    });
    if (existingAccount) {
      throw new Error("Username đã được sử dụng");
    }

    // Lấy role shipper
    const shipperRole = await Role.findOne({ 
      where: { slug: "shipper" } 
    });
    if (!shipperRole) {
      throw new Error("Shipper role not found. Please create 'shipper' role first.");
    }

    const account = new Account();
    account.username = createShipperDto.username;
    account.password = await bcrypt.hash(createShipperDto.password, SALT_ROUNDS);
    account.phone = createShipperDto.phone;
    account.role = shipperRole;
    account.isRegistered = true;
    
    // Sử dụng name field của NamedEntity cho fullName
    account.name = createShipperDto.fullName;

    await account.save();
    return account;
  }

  async getAllShippers(): Promise<Account[]> {
    const shipperRole = await Role.findOne({ where: { slug: "shipper" } });
    if (!shipperRole) return [];

    return await Account.find({
      where: { role: { id: shipperRole.id } },
      relations: ["role", "shipperOrders"],
      order: { createdAt: "DESC" }
    });
  }

  async getShipperById(id: string): Promise<Account> {
    const account = await Account.findOne({
      where: { id },
      relations: ["role", "shipperOrders"]
    });
    
    if (!account || account.role.slug !== "shipper") {
      throw new EntityNotFoundException("Shipper");
    }
    
    return account;
  }

  async updateShipper(id: string, updateShipperDto: UpdateShipperDto): Promise<Account> {
    const account = await this.getShipperById(id);

    // Kiểm tra username trùng (nếu có update username)
    if (updateShipperDto.username && updateShipperDto.username !== account.username) {
      const existingAccount = await Account.findOne({ 
        where: { username: updateShipperDto.username } 
      });
      if (existingAccount) {
        throw new Error("Username đã được sử dụng");
      }
    }

    // Update fields
    if (updateShipperDto.username) account.username = updateShipperDto.username;
    if (updateShipperDto.fullName) account.name = updateShipperDto.fullName;
    if (updateShipperDto.phone) account.phone = updateShipperDto.phone;
    if (updateShipperDto.password) {
      account.password = await bcrypt.hash(updateShipperDto.password, SALT_ROUNDS);
    }

    await account.save();
    return account;
  }

  async deleteShipper(id: string): Promise<void> {
    const account = await this.getShipperById(id);
    await account.softRemove();
  }

  async getAvailableShippers(): Promise<Account[]> {
    const shipperRole = await Role.findOne({ where: { slug: "shipper" } });
    if (!shipperRole) return [];

    return await Account.find({
      where: { 
        role: { id: shipperRole.id },
        isRegistered: true 
      },
      relations: ["role"]
    });
  }

  async getShipperByUsername(username: string): Promise<Account> {
    const account = await Account.findOne({
      where: { username },
      relations: ["role", "shipperOrders"]
    });
    
    if (!account || account.role.slug !== "shipper") {
      throw new EntityNotFoundException("Shipper");
    }
    
    return account;
  }
}
