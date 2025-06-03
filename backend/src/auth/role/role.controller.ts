import { Controller, Get, Post } from "routing-controllers";
import { Service } from "typedi";
import { RoleService } from "./role.service";

@Service()
@Controller('/auth')
export class RoleController{
    constructor(
        private roleService: RoleService
    ){}

    @Get('/roles')
    async getAllRoles(){
        return await this.roleService.getAllRoles();
    }

    @Post('/roles/create-admin')
    async createAdminRole(){
        return await this.roleService.createAdminRole();
    }
}