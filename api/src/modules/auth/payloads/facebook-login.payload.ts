import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class FacebookLoginPayload {
    @ApiProperty({
        description: "Facebook access token returned from Facebook SDK",
    })
    @IsString()
    @IsNotEmpty()
    accessToken: string;

    @ApiProperty({
        description: "Facebook user ID",
    })
    @IsString()
    @IsNotEmpty()
    userID: string;
}

