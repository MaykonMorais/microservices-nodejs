import { orders } from "./channels/orders.ts";

orders.consume(
  "orders",
  async (message) => {
    if (!message) return;

    console.log("Received order message:", message?.content.toString());

    orders.ack(message);
  },
  {
    noAck: false,
  }
);
