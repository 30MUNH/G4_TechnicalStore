import { Service } from "typedi";
import { Role } from "./role.entity";
import { Not } from "typeorm";

@Service()
export class RoleService {
  async createRoles(): Promise<void> {
    const admin = await Role.findOne({
      where: {
        name: "admin",
      },
    });
    if (admin == null) {
      const role = new Role();
      role.name = "admin";
      await role.save();
    }
    const manager = await Role.findOne({
      where: {
        name: "manager"
      }
    });
    if(manager == null){
      const role = new Role();
      role.name = "manager";
      await role.save();
    }
    const staff = await Role.findOne({
      where: {
        name: "staff"
      }
    });
    if(staff == null){
      const role = new Role();
      role.name = "staff";
      await role.save();
    }
    const customer = await Role.findOne({
      where: {
        name: "customer"
      }
    });
    if(customer == null){
      const role = new Role();
      role.name = "customer";
      await role.save();
    }
    const shipper = await Role.findOne({
      where: {
        name: "shipper"
      }
    });
    if(shipper == null){
      const role = new Role();
      role.name = "shipper";
      await role.save();
    }
  }

  async getAllRoles(){
    return await Role.find(
      {
        where: {
          name: Not("admin"),
        }
      }
    );
  }
}
