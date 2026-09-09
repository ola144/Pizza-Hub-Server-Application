import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "PizzaHub API",
      version: "1.0.0",
      description:
        "API documentation for the PizzaHub pizza ordering and inventory management application.",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
      {
        url: "https://pizza-hub-server-application.onrender.com",
        description: "Production server",
      },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
    paths: {
      "/api/v1/auth/register": {
        post: {
          tags: ["Authentication"],
          summary: "Register a new customer account",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User registered successfully" },
            400: { description: "Bad request" },
          },
        },
      },
      "/api/v1/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Log in a customer or admin",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/v1/auth/forgot-password": {
        post: {
          tags: ["Authentication"],
          summary: "Request password reset email",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: {
                    email: { type: "string", format: "email" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Reset link sent" },
          },
        },
      },
      "/api/v1/auth/reset-password/{token}": {
        post: {
          tags: ["Authentication"],
          summary: "Reset password using token",
          parameters: [
            {
              name: "token",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["password"],
                  properties: {
                    password: { type: "string", minLength: 6 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Password reset successful" },
          },
        },
      },
      "/api/v1/inventory": {
        get: {
          tags: ["Inventory"],
          summary: "Get all inventory items",
          responses: {
            200: { description: "Inventory list returned" },
          },
        },
        post: {
          tags: ["Inventory"],
          summary: "Create a new inventory item",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "price", "stock"],
                  properties: {
                    name: { type: "string" },
                    price: { type: "number" },
                    stock: { type: "number" },
                    threshold: { type: "number" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Inventory item created" },
          },
        },
      },
      "/api/v1/orders": {
        post: {
          tags: ["Orders"],
          summary:
            "Creates a new pizza order from the selected base, sauce, cheese, and optional vegetables.",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",

                  required: ["baseId", "sauceId", "cheeseId"],

                  properties: {
                    baseId: {
                      type: "string",
                      description: "MongoDB ID of the selected pizza base",
                      example: "68c123456789abcdef123456",
                    },

                    sauceId: {
                      type: "string",
                      description: "MongoDB ID of the selected pizza sauce",
                      example: "68c123456789abcdef123457",
                    },

                    cheeseId: {
                      type: "string",
                      description: "MongoDB ID of the selected cheese",
                      example: "68c123456789abcdef123458",
                    },

                    vegetableIds: {
                      type: "array",
                      description:
                        "MongoDB IDs of the selected vegetables. Multiple vegetables can be selected.",
                      items: {
                        type: "string",
                        example: "68c123456789abcdef123459",
                      },
                      example: [
                        "68c123456789abcdef123459",
                        "68c123456789abcdef123460",
                        "68c123456789abcdef123461",
                      ],
                    },
                  },
                },
                example: {
                  baseId: "68c123456789abcdef123456",
                  sauceId: "68c123456789abcdef123457",
                  cheeseId: "68c123456789abcdef123458",
                  vegetableIds: [
                    "68c123456789abcdef123459",
                    "68c123456789abcdef123460",
                  ],
                },
              },
            },
          },
          responses: {
            201: {
              description: "Order created successfully",
            },

            400: {
              description:
                "Invalid ingredients, duplicate ingredients, or insufficient stock",
            },

            401: {
              description: "Unauthorized",
            },

            500: {
              description: "Internal server error",
            },
          },
        },
        get: {
          tags: ["Orders"],
          summary: "Get current user order history",
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: "Orders returned" },
          },
        },
      },
      "/api/v1/orders/{id}": {
        get: {
          tags: ["Orders"],
          summary: "Get a specific order by id",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Order details returned" },
          },
        },
      },
      "/api/v1/admin/orders": {
        get: {
          tags: ["Admin Orders"],
          summary: "Get all orders for admin dashboard",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 10 },
            },
            {
              name: "status",
              in: "query",
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Paginated admin orders returned" },
          },
        },
      },
      "/api/v1/admin/orders/{id}/status": {
        patch: {
          tags: ["Admin Orders"],
          summary: "Update order status",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
              example: "68c123456789abcdef123499",
            },
          ],

          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: {
                      type: "string",
                      enum: [
                        "pending_payment",
                        "order_received",
                        "in_kitchen",
                        "sent_to_delivery",
                        "delivered",
                        "cancelled",
                      ],
                      example: "in_kitchen",
                    },
                  },
                },
              },
            },
          },

          responses: {
            200: {
              description: "Order status updated successfully",
            },
            400: {
              description: "Invalid status transition",
            },
            401: {
              description: "Unauthorized",
            },
            403: {
              description: "Admin access required",
            },
            404: {
              description: "Order not found",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
