import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import userRoutes from "./Router/userRouter.js";
import postRoutes from "./Router/postRouter.js";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import formbody from "@fastify/formbody";
import multipart from "@fastify/multipart";

const fastify = Fastify({
  logger: {
    level: "info", // You can set this to 'error', 'warn', 'info' as needed
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "SYS:standard",
        ignore: "pid,hostname", // Removes system info like laptop name
        singleLine: true,
        colorize: true,
      },
    },
  },
});

// fastify.register(fastifyCors, {
//   // origin: process.env.CROS_ORIGIN_WHITELIST,
//   origin: true,
//   credentials: true,
// });

fastify.register(fastifyCors, {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

fastify.register(fastifyCookie);

// Register Swagger UI
fastify.register(fastifySwagger);

fastify.register(formbody);
fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
  attachFieldsToBody: true,
});

fastify.register(fastifySwaggerUI, {
  routePrefix: "/swagger",
});

// Declare a route
fastify.get("/", async function handler(request, reply) {
  return { hello: "world" };
});
// fastify.addHook("preHandler", auth)
fastify.register(userRoutes, { prefix: "/api/user" });

fastify.register(postRoutes, { prefix: "/api/post" });

fastify.get("/ping", async function handler(req, res) {
  return res.status(200).send("PONG");
});
// Run the server!
try {
  await fastify.listen({ port: 8000 });
  console.log("/n/nFastify is listning ....");
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
