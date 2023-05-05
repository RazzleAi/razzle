import { Module } from "@nestjs/common";
import { AccountModule } from "../account/account.module";
import { AppsModule } from "../apps/apps.module";
import { DefaultAppsHelperModule } from "../default-apps/default-apps-helpers.module";
import { UserModule } from "../user/user.module";
import { BootstrapService } from "./bootstrap.service";
import { AuthModule } from "../auth/auth.module";
import { WorkspaceModule } from "../workspace/workspace.module";

@Module({
    imports: [UserModule, AccountModule, AppsModule, WorkspaceModule, DefaultAppsHelperModule, AuthModule],
    providers: [BootstrapService],
    exports: [BootstrapService],
})
export class BootstrapModule {

}