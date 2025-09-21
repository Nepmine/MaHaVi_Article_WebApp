// import { PrismaClient } from "prisma/client";
import { PrismaClient } from "../generated/prisma/index.js";
// import { PrismaClient } from './generated/prisma'
// import { ObjectId } from 'bson'
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const prisma = new PrismaClient();

// [POST Protected] http://localhost:8000/api/post/createPost
// Data required: not(likes, authorId)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createPost = async (req, reply) => {
  try {
    const userResponse = await prisma.user.findFirst({
      where: { googleId: req.user.googleId },
      select: { userId: true, authorProfile: true },
    });

    if (!userResponse) return reply.code(403).send("Please Login First !!");
    if (!userResponse.authorProfile)
      return reply.code(401).send("You dont have permission !!");

    let frontImageUrl;
    if (req.files?.frontImageUrl) {
      const fileBuffer = req.files.frontImageUrl.data;
      frontImageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "news_posts" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
      });
    }

    let content = req.body.content;
    if (typeof content === "string") {
      content = JSON.parse(content); // [Added] Parse stringified JSON
    }

    const files = req.files?.content || []; // [Added] array of content images
    let index = 0;

    for (const segment of content) {
      if (segment.type === "IMAGE" && files[index]) {
        const fileBuffer = files[index].data; // [Added] file buffer for each image
        const imageUrlStore = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "news_posts" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(uploadStream);
        });
        segment.content = imageUrlStore; // [Modified] replace placeholder with uploaded URL
        index++;
      }
    }

    const serverResponse = await prisma.post.create({
      data: {
        ...req.body, // spread body
        content: content, // override with updated content
        frontImageUrl: frontImageUrl,
      },
    });

    return reply.code(200).send(response);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ error: "Failed to create post" });
  }
};

// [POST] http://localhost:8000/api/post/like
// Data required: not(postId)  ::  likes accroding to liked post stored in database
export const likePost = async (req, res) => {
  const { postId } = req.body;
  const googleId = req.user.googleId;

  try {
    console.log("req body ...............", req.body);

    // find the user
    const user = await prisma.user.findUnique({
      where: { googleId },
      select: { id: true, likedPostIds: true },
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // check if postId is already in user.postIDs
    const alreadyLiked = user.likedPostIds.includes(postId);
    let like = 0;

    if (alreadyLiked) {
      like = -1; // Unlike
      // remove postId from user.postIDs

      const existingPost = await prisma.post.findUnique({
        where: { postId },
        select: { uesrIDs: true },
      });

      if (!existingPost) {
        return res.status(404).send("Post not found");
      }

      await prisma.user.update({
        where: { googleId },
        data: {
          postIDs: { set: user.likedPostIds.filter((p) => p !== postId) },
        },
      });

      // remove userId from post.uesrIDs
      await prisma.post.update({
        where: { postId },
        data: {
          uesrIDs: {
            set: existingPost.uesrIDs.filter((uid) => uid !== user.userId),
          },
          likes: { decrement: 1 },
        },
      });
    } else {
      like = 1; // Like
      // add postId to user.postIDs
      await prisma.user.update({
        where: { googleId },
        data: {
          likedPostIds: { push: postId },
        },
      });

      // add userId to post.uesrIDs
      await prisma.post.update({
        where: { postId },
        data: {
          likedUser: { push: user.userId },
          likes: { increment: 1 },
        },
      });
    }

    return res.status(200).send(like === 1 ? "Liked" : "Unliked");
  } catch (ex) {
    console.log("EX:", ex);
    return res.status(500).send("Data not updated:::");
  }
};

// [GET] http://localhost:8000/api/post/getHomePosts
// Data required: not(postId)
export const getHomePosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      select: {
        postId: true,
        title: true,
        frontImageUrl: true,
        headline: true,
        likes: true,
        createdAt: true,
      },
    });
    return res.status(200).send(posts);
  } catch (ex) {
    return res.status(500).send("Internal Server Error");
  }
};
