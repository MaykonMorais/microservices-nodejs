import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

import { cluster } from "../cluster";
import { appLoadBalancer, networkLoadBalancer } from "../load-balancer";

import { kongDockerImage } from "../images/kong";
import { ordersListener } from "../services/orders";

// Proxy
const proxyTargetGroup = appLoadBalancer.createTargetGroup(
  "kong-proxy-target",
  {
    port: 8000,
    protocol: "HTTP",
    healthCheck: {
      path: "/orders/health",
      protocol: "HTTP",
    },
  },
);

const proxyHttpListener = appLoadBalancer.createListener(
  "kong-proxy-listener",
  {
    port: 80,
    protocol: "HTTP",
    targetGroup: proxyTargetGroup,
  },
);

// Admin UI
const adminTargetGroup = appLoadBalancer.createTargetGroup(
  "kong-admin-target",
  {
    port: 8002,
    protocol: "HTTP",
    healthCheck: {
      path: "/",
      protocol: "HTTP",
    },
  },
);

const adminHttpListener = appLoadBalancer.createListener(
  "kong-admin-listener",
  {
    port: 8002,
    protocol: "HTTP",
    targetGroup: adminTargetGroup,
  },
);

// Admin API
const adminAPITargetGroup = appLoadBalancer.createTargetGroup(
  "kong-admin-api-target",
  {
    port: 8001,
    protocol: "HTTP",
    healthCheck: {
      path: "/",
      protocol: "HTTP",
    },
  },
);

const adminAPIHttpListener = appLoadBalancer.createListener(
  "kong-admin-api-listener",
  {
    port: 8001,
    protocol: "HTTP",
    targetGroup: adminAPITargetGroup,
  },
);

export const kongService = new awsx.classic.ecs.FargateService("fargate-kong", {
  cluster,
  desiredCount: 1,
  waitForSteadyState: false,
  taskDefinitionArgs: {
    container: {
      image: kongDockerImage.ref,
      cpu: 256,
      memory: 512,
      portMappings: [
        proxyHttpListener,
        adminHttpListener,
        adminAPIHttpListener,
      ],
      environment: [
        { name: "KONG_DATABASE", value: "off" },
        { name: "KONG_ADMIN_LISTEN", value: "0.0.0.0:8001" },
        {
          name: "ORDERS_SERVICE_URL",
          value: pulumi.interpolate`http://${ordersListener.endpoint.hostname}:${ordersListener.endpoint.port}`,
        },
      ],
    },
  },
});
