import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

import { cluster } from "../cluster";
import { ordersDockerImage } from "../images/orders";
import { rabbitMQAdminHttpListener, amqpListener } from "./rabbitmq";

export const ordersService = new awsx.classic.ecs.FargateService(
  "fargate-orders",
  {
    cluster,
    desiredCount: 1,
    waitForSteadyState: false,
    taskDefinitionArgs: {
      container: {
        image: ordersDockerImage.ref,
        cpu: 256,
        memory: 512,
        environment: [
          {
            name: "BROKER_URL",
            value: pulumi.interpolate`amqp://admin:admin@${amqpListener.endpoint.hostname}:${amqpListener.endpoint.port}`,
          },
        ],
      },
    },
  },
);
