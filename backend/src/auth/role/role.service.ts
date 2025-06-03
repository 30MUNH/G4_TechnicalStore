import { Service } from "typedi";
import { Role } from "./role.entity";

@Service()
export class RoleService {
  async createAdminRole(): Promise<Role> {
    const admin = await Role.findOne({
      where: {
        name: "admin",
      },
    });
    if (admin == null) {
      const role = new Role();
      role.name = "admin";
      await role.save();
      return role;
    }
    else return admin;
  }

  async getAllRoles(){
    return await Role.find();
  }
}
