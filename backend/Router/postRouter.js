import {
  createPost,
  likePost,
  getHomePosts,
  getPost,
  updatePost,
  deletePost,
  comment,
  editComment,
  deleteComment,
} from "../Controllers/postController.js";
import { auth } from "../Middlewares/auth.js";

const postSchema = {
  body: {
    type: "object",
    required: ["title", "headline"],
    properties: {
      postId: { type: "string" },
      title: { type: "string" },
      headline: { type: "string" },
      frontImageUrl: { type: "string" },
      content: { type: "string" },
    },
  },
};

const postupdateSchema = {
  body: {
    type: "object",
    required: ["postId"],
    properties: {
      postId: { type: "string" },
      title: { type: "string" },
      headline: { type: "string" },
      frontImageUrl: { type: "string" },
      content: { type: "string" },
    },
  },
};

const likeSchema = {
  body: {
    type: "object",
    required: ["postId"],
    properties: {
      postId: { type: "string" },
    },
  },
};

export default async function (fastify, opts) {
  // [POST Protected] http://localhost:8000/api/post/createPost
  fastify.post(
    "/createPost",
    { preHandler: auth, schema: postSchema },
    createPost
  );

  // [POST Protected] http://localhost:8000/api/post/updatePost
  fastify.post(
    "/updatePost",
    { preHandler: auth, schema: postupdateSchema },
    updatePost
  );

  // [POST Protected] http://localhost:8000/api/post/deltetePost
  fastify.post("/deletePost", { preHandler: auth }, deletePost);

  // [POST Protected] http://localhost:8000/api/post/post
  fastify.post("/likePost", { preHandler: auth, schema: likeSchema }, likePost);

  // [GET] http://localhost:8000/api/post/getHomePosts
  fastify.get("/getHomePosts", getHomePosts);

  // [GET] http://localhost:8000/api/post/getPost/{postId}
  fastify.get("/getPost/:postId", getPost);

  // [GET] http://localhost:8000/api/post/comment
  fastify.post("/comment",{ preHandler: auth }, comment);

  // [GET] http://localhost:8000/api/post/editComment
  fastify.post("/editComment",{ preHandler: auth }, editComment);

  // [GET] http://localhost:8000/api/post/deleteComment
  fastify.post("/deleteComment",{ preHandler: auth }, deleteComment);
}
