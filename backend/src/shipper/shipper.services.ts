import { Service } from "typedi";
import { Account } from "@/auth/account/account.entity";
import { Role } from "@/auth/role/role.entity";
import { CreateShipperDto, UpdateShipperDto } from "./dtos/shipper.dtos";
import { EntityNotFoundException, BadRequestException } from "@/exceptions/http-exceptions";
import * as bcrypt from 'bcrypt';
import { getManager } from 'typeorm';

const SALT_ROUNDS = 8;

@Service()
export class ShipperService {
  private validatePhoneNumber(phone: string): void {
    const phoneRegex = /^0\d{9}$/;  // Format: 0xxxxxxxxx (10 digits)
    if (!phoneRegex.test(phone)) {
      throw new BadRequestException('Số điện thoại không hợp lệ. Phải có 10 chữ số và bắt đầu bằng số 0');
    }
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 8 ký tự');
    }
    if (!/\d/.test(password)) {
      throw new BadRequestException('Mật khẩu phải chứa ít nhất 1 số');
    }
    if (!/[a-zA-Z]/.test(password)) {
      throw new BadRequestException('Mật khẩu phải chứa ít nhất 1 chữ cái');
    }
  }

  private validateUsername(username: string): void {
    if (username.length < 3 || username.length > 50) {
      throw new BadRequestException('Username phải có độ dài từ 3 đến 50 ký tự');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new BadRequestException('Username chỉ được chứa chữ cái, số và dấu gạch dưới');
    }
  }

  async createShipper(createShipperDto: CreateShipperDto): Promise<Account> {
    try {
      return getManager().transaction(async transactionalEntityManager => {
        // Validate fields
        this.validateUsername(createShipperDto.username);
        this.validatePassword(createShipperDto.password);
        this.validatePhoneNumber(createShipperDto.phone);

        // Check for existing account
        const existingAccount = await transactionalEntityManager.findOne(Account, { 
          where: [
            { username: createShipperDto.username },
            { phone: createShipperDto.phone }
          ]
        });

        if (existingAccount) {
          if (existingAccount.username === createShipperDto.username) {
            throw new BadRequestException("Username đã được sử dụng");
          }
          if (existingAccount.phone === createShipperDto.phone) {
            throw new BadRequestException("Số điện thoại đã được sử dụng");
          }
        }

        const shipperRole = await transactionalEntityManager.findOne(Role, { 
          where: { slug: "shipper" } 
        });
        if (!shipperRole) {
          throw new BadRequestException("Shipper role not found. Please create 'shipper' role first.");
        }

        const account = new Account();
        account.username = createShipperDto.username;
        account.password = await bcrypt.hash(createShipperDto.password, SALT_ROUNDS);
        account.phone = createShipperDto.phone;
        account.role = shipperRole;
        account.isRegistered = true;
        account.name = createShipperDto.fullName;

        return await transactionalEntityManager.save(account);
      });
    } catch (error) {
      console.error('❌ [ShipperService] Error in createShipper:', error);
      throw error;
    }
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
    try {
      return getManager().transaction(async transactionalEntityManager => {
        const account = await this.getShipperById(id);

        if (updateShipperDto.username) {
          this.validateUsername(updateShipperDto.username);
          if (updateShipperDto.username !== account.username) {
            const existingAccount = await transactionalEntityManager.findOne(Account, { 
              where: { username: updateShipperDto.username } 
            });
            if (existingAccount) {
              throw new BadRequestException("Username đã được sử dụng");
            }
          }
        }

        if (updateShipperDto.phone) {
          this.validatePhoneNumber(updateShipperDto.phone);
          if (updateShipperDto.phone !== account.phone) {
            const existingAccount = await transactionalEntityManager.findOne(Account, { 
              where: { phone: updateShipperDto.phone } 
            });
            if (existingAccount) {
              throw new BadRequestException("Số điện thoại đã được sử dụng");
            }
          }
        }

        if (updateShipperDto.password) {
          this.validatePassword(updateShipperDto.password);
          account.password = await bcrypt.hash(updateShipperDto.password, SALT_ROUNDS);
        }

        // Update other fields
        if (updateShipperDto.username) account.username = updateShipperDto.username;
        if (updateShipperDto.fullName) account.name = updateShipperDto.fullName;
        if (updateShipperDto.phone) account.phone = updateShipperDto.phone;

        return await transactionalEntityManager.save(account);
      });
    } catch (error) {
      console.error('❌ [ShipperService] Error in updateShipper:', error);
      throw error;
    }
  }

  async deleteShipper(id: string): Promise<void> {
    try {
      return getManager().transaction(async transactionalEntityManager => {
        const account = await this.getShipperById(id);
        
        // Check if shipper has active orders
        const hasActiveOrders = account.shipperOrders?.some(order => 
          ['PENDING', 'PROCESSING', 'SHIPPING'].includes(order.status)
        );

        if (hasActiveOrders) {
          throw new BadRequestException('Không thể xóa shipper đang có đơn hàng đang xử lý');
        }

        await transactionalEntityManager.softRemove(account);
      });
    } catch (error) {
      console.error('❌ [ShipperService] Error in deleteShipper:', error);
      throw error;
    }
  }

  async getAvailableShippers(): Promise<Account[]> {
    try {
      const shipperRole = await Role.findOne({ where: { slug: "shipper" } });
      if (!shipperRole) return [];

      return await Account.find({
        where: { 
          role: { id: shipperRole.id },
          isRegistered: true
        },
        relations: ["role"]
      });
    } catch (error) {
      console.error('❌ [ShipperService] Error in getAvailableShippers:', error);
      throw error;
    }
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
