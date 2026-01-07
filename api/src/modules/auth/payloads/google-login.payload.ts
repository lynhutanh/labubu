import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GoogleLoginPayload {
    @ApiProperty({
        description: "Google ID token credential returned from Google One Tap",
    })
    @IsString()
    @IsNotEmpty()
    credential: string;
}
