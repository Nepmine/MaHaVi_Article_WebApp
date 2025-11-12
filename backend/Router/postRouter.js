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
  allTrendings,
  addTrending,
  removeTrending,
  allArticles,
  createGallery,
  getAllGalleries,
  deleteGallery,
  deleteGalleryImage,
  likeGallery,
  getRecentNews,
  getCategory,
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
      category: {
        type: "array",
        items: { type: "string" },
      },
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
    "/createPost/:type",
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

  // [GET] http://localhost:8000/api/post/getRecentNews
  fastify.get("/getRecentNews/:recentCount", getRecentNews);

  // [GET] http://localhost:8000/api/post/getCategory
  fastify.get("/getCategory/:category", getCategory);

  // [GET] http://localhost:8000/api/post/getPost/{postId}
  fastify.get("/getPost/:postId", getPost);

  // [GET] http://localhost:8000/api/post/comment
  fastify.post("/comment", { preHandler: auth }, comment);

  // [GET] http://localhost:8000/api/post/editComment
  fastify.post("/editComment", { preHandler: auth }, editComment);

  // [GET] http://localhost:8000/api/post/deleteComment
  fastify.post("/deleteComment", { preHandler: auth }, deleteComment);

  // [GET] http://localhost:8000/api/get/allTrendings
  fastify.get("/trending", allTrendings);

  // [GET] http://localhost:8000/api/post/trending/{postId}
  fastify.post("/trending/:postId", { preHandler: auth }, addTrending);

  // [GET] http://localhost:8000/api/post/trending/{postId}
  fastify.delete("/trending/:postId", { preHandler: auth }, removeTrending);

  // [GET] http://localhost:8000/api/post/allArticles
  fastify.get("/allArticles", allArticles);

  fastify.get("/getAllGalleries", getAllGalleries);

  fastify.post("/creategallery", { preHandler: auth }, createGallery);

  fastify.post("/likeGallery", { preHandler: auth }, likeGallery);

  fastify.delete("/galleries/:galleryId", { preHandler: auth }, deleteGallery);

  fastify.delete(
    "/galleries/:galleryId/image",
    { preHandler: auth },
    deleteGalleryImage
  );
}
