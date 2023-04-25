import { Module } from "@nestjs/common";
import { DefaultAppsServiceImpl } from "./default-apps.service-impl";

@Module({
    exports: [DefaultAppsServiceImpl],
    providers: [DefaultAppsServiceImpl]
})
export class DefaultAppsHelperModule {}