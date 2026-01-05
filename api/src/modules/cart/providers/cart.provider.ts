import { Connection } from "mongoose";
import { MONGO_DB_PROVIDER } from "src/kernel";
import { cartSchema } from "../schemas";

export const CART_PROVIDER = "CART";

export const cartProviders = [
  {
    provide: CART_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model("cart", cartSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];
