// file: index.js
import Fastify from "fastify";
import FastifyJWT from "../index.js"; // Adjust the path as needed

/**
 * Runs the Fastify server with the provided options.
 * @param {{ token: string, [key: string]: any }} options
 */
export async function run(options) {
  const { token, ...fastifyOptions } = options;

  if (!token) {
    throw new Error("Please provide a token via --token {token}");
  }

  const fastify = Fastify();

  // Register your custom plugin (e.g., JWT plugin or other)
  await fastify.register(FastifyJWT, fastifyOptions);

  // Protected route
  fastify.get(
    "/",
    {
      preValidation: fastify.authenticate,
    },
    async (request) => {
      return request.user;
    }
  );

  // Inject a request to test the route
  const response = await fastify.inject({
    url: "/",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
