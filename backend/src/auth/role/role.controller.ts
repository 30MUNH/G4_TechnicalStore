import { Controller, Get, Post, Req, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { RoleService } from "./role.service";
import { Admin, Auth } from "@/middlewares/auth.middleware";
import { CheckAbility } from "@/middlewares/rbac/permission.decorator";
import { Role } from "./role.entity";

@Service()
@Controller('/auth')
export class RoleController{
    constructor(
        private roleService: RoleService
    ){}

    @Get('/roles')
    @UseBefore(Auth)
    @CheckAbility("read", Role)
    async getAllRoles(@Req() req: any){
        return await this.roleService.getAllRoles();
    }

    @Post('/roles/create-roles')
    @UseBefore(Admin)
    async createRoles(){
        return await this.roleService.createRoles();
    }
}