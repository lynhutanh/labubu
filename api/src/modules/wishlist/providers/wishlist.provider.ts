import { Connection } from "mongoose";
import { MONGO_DB_PROVIDER } from "src/kernel";
import { wishlistSchema } from "../schemas";

export const WISHLIST_PROVIDER = "WISHLIST";

export const wishlistProviders = [
  {
    provide: WISHLIST_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model("wishlist", wishlistSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];




