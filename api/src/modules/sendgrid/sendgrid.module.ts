import { Module } from "@nestjs/common";
import { SettingModule } from "../settings/setting.module";
import { SendgridService } from "./services/sendgrid.service";

@Module({
    imports: [SettingModule],
    providers: [SendgridService],
    exports: [SendgridService],
})
export class SendgridModule { }

