import {
  userLogin,
  userDetails,
  myBlogs,
  myLikedPosts,
  makeAuthor,
  isAuthor,
} from "../Controllers/userController.js";
import { auth } from "../Middlewares/auth.js";

const userSchema = {
  body: {
    type: "object",
    required: ["googleId", "email"],
    properties: {
      googleId: { type: "string" },
      email: { type: "string", format: "email" },
      name: { type: "string" },
      photoUrl: { type: "string" },
      auther: { type: "boolean" },
    },
  },
};

const loginSchema = {
  body: {
    type: "object",
    required: ["token"],
    properties: {
      token: { type: "string" },
    },
  },
};

export default async function (fastify, opts) {
  // [GET] http://localhost:8000/api/user/userLogin
  fastify.get("/userLogin", { preHandler: auth }, userLogin);

  // [POST] http://localhost:8000/api/user/makeAuthor
  fastify.post("/makeAuthor", { preHandler: auth }, makeAuthor);

  // [GET] http://localhost:8000/api/user/protected/ping
  fastify.get("/userDetails", { preHandler: auth }, userDetails);

  // [GET] http://localhost:8000/api/user/protected/ping
  fastify.get("/myBlogs", { preHandler: auth }, myBlogs);

  // [GET] http://localhost:8000/api/user/protected/ping
  fastify.get("/myLikedPosts", { preHandler: auth }, myLikedPosts);

  // [GET] http://localhost:8000/api/user/protected/ping
  fastify.get("/isAuthor", { preHandler: auth }, isAuthor);
}
