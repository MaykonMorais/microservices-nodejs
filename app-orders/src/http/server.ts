import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";

import { z } from "zod";

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { db } from "../db/client.ts";
import { schema } from "../db/schema/index.ts";
import { dispatchOrderCreated } from "../broker/messages/order-created.ts";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: "*",
});

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get("/health", async () => {
  return { status: "OK" };
});

app.post(
  "/orders",
  {
    schema: {
      body: z.object({
        amount: z.number(),
        customerId: z.string(),
      }),
    },
  },
  async (request, response) => {
    const { amount, customerId } = request.body;

    console.log(`Received order for amount: ${amount}`);
    const orderId = crypto.randomUUID();

    const orderData = {
      orderId,
      amount,
      customer: {
        id: customerId,
      },
    };

    try {
      dispatchOrderCreated(orderData);

      await db.insert(schema.orders).values({
        id: orderId,
        customerId,
        amount,
      });

      return response.status(201).send();
    } catch (error) {
      console.error("Error processing order:", error);
      return response.status(500).send({ error: "Internal Server Error" });
    }
  }
);

app.listen({ host: "0.0.0.0", port: 3333 }).then(() => {
  console.log("[Orders] HTTP server running on http://localhost:3333");
});
