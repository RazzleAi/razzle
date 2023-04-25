import { Module } from "@nestjs/common";
import { MixpanelEventTracker } from "./mixpanel-event-tracker";

@Module({
    providers: [MixpanelEventTracker],
    exports: [MixpanelEventTracker],
})
export class MixpanelModule {}