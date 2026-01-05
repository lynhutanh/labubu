import { Connection } from "mongoose";
import { MONGO_DB_PROVIDER } from "src/kernel";
import { productSchema } from "../schemas";
import { PRODUCT_PROVIDER } from "../constants";

export const productProviders = [
  {
    provide: PRODUCT_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model("product", productSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];
