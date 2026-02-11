import Fastify from "fastify";
import cors from "@fastify/cors";

const server = Fastify({
  logger: true,
});

server.register(cors, {
  origin: true,
});


const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "0.0.0.0";

server.listen({ port, host }).catch((error) => {
  server.log.error(error, "Failed to start server");
  process.exit(1);
});
