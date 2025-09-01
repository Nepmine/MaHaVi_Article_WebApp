// import { PrismaClient } from "prisma/client";
import { PrismaClient } from '../generated/prisma/index.js'
// import { PrismaClient } from './generated/prisma'
// import { ObjectId } from 'bson'
import { ObjectId } from 'mongodb';
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";



const prisma = new PrismaClient()

// [POST Protected] http://localhost:8000/api/post/createPost
// Data required: not(likes, authorId)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createPost = async (req, reply) => {
  try {
    const parts = req.parts();
    let title, headline, article, fileBuffer;

    for await (const part of parts) {
      if (part.file) {
        fileBuffer = await part.toBuffer();
      } else {
        if (part.fieldname === "title") title = part.value;
        if (part.fieldname === "headline") headline = part.value;
        if (part.fieldname === "article") article = part.value;
      }
    }

    const userResponse = await prisma.user.findFirst({
      where: { googleId: req.user.googleId }, 
    });

    if (!userResponse) {
      return reply.code(403).send("Please Login First !!");
    }

    let imageUrl = null;
    if (fileBuffer) {
      imageUrl = await new Promise((resolve, reject) => {
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

    const response = await prisma.post.create({
      data: {
        title,
        article,
        headline,
        imageUrl,
        authorId: userResponse.id,
        likes: 0,
      },
    });

    await prisma.user.update({
      where: { id: userResponse.id },
      data: { auther: true },
    })

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
    const userEmail = req.user.email;

    try {
        console.log("req body ...............", req.body);

        // find the user
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            select: { id: true, postIDs: true }
        });

        if (!user) {
            return res.status(404).send("User not found");
        }

        // check if postId is already in user.postIDs
        const alreadyLiked = user.postIDs.includes(postId);
        let like = 0;

        if (alreadyLiked) {
            like = -1; // Unlike
            // remove postId from user.postIDs
            await prisma.user.update({
                where: { email: userEmail },
                data: {
                    postIDs: { set: user.postIDs.filter(p => p !== postId) }
                }
            });

            const existingPost = await prisma.post.findUnique({
                where: { id: postId },
                select: { uesrIDs: true }
            });

            if (!existingPost) {
                return res.status(404).send("Post not found");
            }

            // remove userId from post.uesrIDs
            await prisma.post.update({
                where: { id: postId },
                data: {
                    uesrIDs: { set: existingPost.uesrIDs.filter(uid => uid !== user.id) },
                    likes: { decrement: 1 }
                }
            });
        } else {
            like = 1; // Like
            // add postId to user.postIDs
            await prisma.user.update({
                where: { email: userEmail },
                data: {
                    postIDs: { push: postId }
                }
            });

            // add userId to post.uesrIDs
            await prisma.post.update({
                where: { id: postId },
                data: {
                    uesrIDs: { push: user.id },
                    likes: { increment: 1 }
                }
            });
        }

        return res.status(200).send(like === 1 ? "Liked" : "Unliked");
    }
    catch (ex) {
        console.log("EX:", ex);
        return res.status(500).send("Data not updated:::");
    }
};



// [GET] http://localhost:8000/api/post/getHomePosts
// Data required: not(postId)  ::  likes accroding to liked post stored in database
export const getHomePosts = async (req, res) => {

    const posts = await prisma.post.findMany();

    const scoredPosts = posts.map(post => {
        const hoursSincePost = (Date.now() - new Date(post.createdAt)) / (1000 * 60 * 60);
        const score = post.likes * 2 - hoursSincePost * 0.5;
        return { ...post, score };
    });

    return res.status(200).send(scoredPosts.sort((a, b) => b.score - a.score));
};
