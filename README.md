# Microservices Node.js com Pulumi

Um projeto completo de microserviços em Node.js com arquitetura moderna, orquestração via Pulumi e infraestrutura como código na AWS.

## 🏗️ Arquitetura

- **app-orders**: Serviço de pedidos que expõe uma API REST
- **app-invoices**: Serviço de faturas que consome mensagens do broker
- **Kong**: API Gateway para roteamento de requisições
- **RabbitMQ**: Message Broker para comunicação entre serviços
- **Pulumi**: Infraestrutura como código para provisionamento na AWS
- **Jaeger**: Rastreamento distribuído (OTEL)
- **PostgreSQL**: Banco de dados para persistência

## 📋 Pré-requisitos

- Node.js >= 22
- Docker & Docker Compose
- Pulumi CLI >= 3.0
- Credenciais AWS configuradas
- Yarn (opcional, mas recomendado)

## 📁 Estrutura do Projeto

```
.
├── app-orders/                # Serviço de Pedidos
│   ├── src/
│   │   ├── http/              # Servidor Fastify
│   │   ├── db/                # Schema e migrations Drizzle
│   │   ├── broker/            # Integração RabbitMQ
│   │   └── tracer/            # OpenTelemetry
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── app-invoices/              # Serviço de Faturas
│   ├── src/
│   │   ├── http/              # Servidor Fastify
│   │   ├── db/                # Schema e migrations Drizzle
│   │   └── broker/            # Consumidor RabbitMQ
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── infra/                      # Infraestrutura Pulumi
│   ├── src/
│   │   ├── cluster.ts          # ECS Cluster
│   │   ├── load-balancer.ts    # ALB e NLB
│   │   ├── images/             # ECR e Docker Images
│   │   └── services/           # Serviços Fargate
│   └── index.ts
│
├── contracts/                  # Interfaces compartilhadas
│   └── messages/
│
├── docker/                     # Configurações Docker
│   └── kong/                   # Kong API Gateway
│
└── docker-compose.yml          # Orquestração local
```

## 🔧 Variáveis de Ambiente

### app-orders (.env)

```env
DATABASE_URL="postgresql://user:password@host:5432/orders"
BROKER_URL="amqp://admin:admin@localhost:5672"
OTEL_SERVICE_NAME="orders"
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
```

### app-invoices (.env)

```env
DATABASE_URL="postgresql://user:password@host:5433/invoices"
BROKER_URL="amqp://admin:admin@localhost:5672"
OTEL_SERVICE_NAME="invoices"
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
```

## 🔍 Observabilidade

O projeto inclui integração completa com OpenTelemetry:

- **Traces**: Jaeger em http://localhost:16686
- **Métricas**: Configuradas para Grafana Cloud
- **Instrumentações**: HTTP, Fastify, PostgreSQL, AMQP

## 🐳 Docker & Pulumi

### Imagens Customizadas

- **Orders**: Construída a partir de app-orders
- **Invoices**: Padrão Node.js (comentado em Kong)
- **Kong**: Customizada com envsubst para templates

## ☁️ Infraestrutura AWS

- **ECS Fargate**: Orquestração de containers
- **Application Load Balancer**: Roteamento HTTP
- **Network Load Balancer**: Roteamento TCP (AMQP)
- **ECR**: Registro de imagens Docker
- **Security Groups**: Controle de acesso
