import { PrismaClient } from "../generated/prisma/index.js";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// [POST Protected] http://localhost:8000/api/post/createPost
// Data required: title, headline
export const createPost = async (req, reply) => {
  try {
    // [Modified] Fetch user with authorProfile relation included
    const userResponse = await prisma.user.findFirst({
      where: { googleId: req.user.sub },
      include: { authorProfile: true },
    });

    if (!userResponse) return reply.code(403).send("Please Login First !!");
    if (!userResponse.authorProfile)
      return reply.code(401).send("You don't have permission !!");

    // [Modified] Parse and normalize content (array of segments)
    const { title, headline, frontImageUrl, content } = req.body;

    // [Modified] Save post with proper schema mapping
    const serverResponse = await prisma.post.create({
      data: {
        title,
        headline,
        frontImageUrl,
        content, // [Modified] use updated segments, not original content
        author: { connect: { authorId: userResponse.authorProfile.authorId } }, // [Added] connect post to author
      },
    });

    return reply.code(200).send(serverResponse); // [Modified] return correct variable
  } catch (error) {
    console.error("Prisma/Post creation error:", error);
    return reply.code(500).send({
      error: "Failed to create post",
      message: error.message, // [Added] to see actual cause
      stack: error.stack, // [Added] optional for debugging
    });
  }
};

// [POST Protected] http://localhost:8000/api/post/updatePost
// Data required: postId
export const updatePost = async (req, reply) => {
  try {
    // [Modified] Fetch user with authorProfile and only postId of their posts
    const userResponse = await prisma.user.findFirst({
      where: { googleId: req.user.sub },
      include: {
        authorProfile: {
          include: {
            posts: {
              select: { postId: true },
            },
          },
        },
      },
    });

    if (!userResponse) return reply.code(403).send("Please Login First !!");
    if (!userResponse.authorProfile)
      return reply.code(401).send("You don't have permission !!");

    // [Modified] Extract postId from body
    const { postId, title, headline, frontImageUrl, content } = req.body;

    // [Added] Check if postId belongs to this author
    const isOwner = userResponse.authorProfile.posts.some(
      (post) => post.postId === postId
    );
    if (!isOwner) return reply.code(403).send("Only owner can update !!");

    // [Modified] Perform the update
    const serverResponse = await prisma.post.update({
      where: { postId },
      data: {
        title,
        headline,
        frontImageUrl,
        content,
        updatedAt: new Date(),
      },
    });

    return reply.code(200).send({
      message: "Post updated successfully!",
      post: serverResponse,
    });
  } catch (error) {
    console.error("Prisma/Post update error:", error);
    return reply.code(500).send({
      error: "Failed to update post",
      message: error.message,
      stack: error.stack,
    });
  }
};

// [POST Protected] http://localhost:8000/api/post/deletePost
// Data required: postId
export const deletePost = async (req, reply) => {
  try {
    // [Modified] Fetch user with authorProfile and only postId of their posts
    const userResponse = await prisma.user.findFirst({
      where: { googleId: req.user.sub },
      include: {
        authorProfile: {
          include: {
            posts: {
              select: { postId: true },
            },
          },
        },
      },
    });

    if (!userResponse) return reply.code(403).send("Please Login First !!");
    if (!userResponse.authorProfile)
      return reply.code(401).send("You don't have permission !!");

    // [Modified] Extract postId from body
    const { postId } = req.body;

    // [Added] Check if postId belongs to this author
    const isOwner = userResponse.authorProfile.posts.some(
      (post) => post.postId === postId
    );
    if (!isOwner) return reply.code(403).send("Only owner can delete post !!");

    // [Modified] Perform the update
    const deletedPost = await prisma.post.delete({
      where: { postId },
    });

    return reply.code(200).send({
      message: "Post deleted successfully!",
      post: deletedPost,
    });
  } catch (error) {
    console.error("Prisma/Post deletion error:", error);
    return reply.code(500).send({
      error: "Failed to delete post",
      message: error.message,
      stack: error.stack,
    });
  }
};

// [POST] http://localhost:8000/api/post/like
// Data required: not(postId)  ::  likes accroding to liked post stored in database
export const likePost = async (req, res) => {
  const { postId } = req.body;
  const googleId = req.user.sub;

  try {
    const user = await prisma.user.findUnique({
      where: { googleId },
      select: { userId: true, likedPostIds: true },
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const alreadyLiked = user.likedPostIds.includes(postId);

    if (alreadyLiked) {
      // Unlike
      await prisma.user.update({
        where: { googleId },
        data: {
          likedPostIds: { set: user.likedPostIds.filter((p) => p !== postId) },
        },
      });

      await prisma.post.update({
        where: { postId },
        data: {
          likedUser: {
            set: (
              await prisma.post.findUnique({
                where: { postId },
                select: { likedUser: true },
              })
            ).likedUser.filter((uid) => uid !== user.userId),
          },
          likes: { decrement: 1 },
        },
      });

      return res.status(200).send("Unliked");
    } else {
      // Like
      await prisma.user.update({
        where: { googleId },
        data: {
          likedPostIds: { push: postId },
        },
      });

      await prisma.post.update({
        where: { postId },
        data: {
          likedUser: { push: user.userId },
          likes: { increment: 1 },
        },
      });

      return res.status(200).send("Liked");
    }
  } catch (ex) {
    console.error("Like error:", ex);
    return res.status(500).send("Failed to update like status");
  }
};

// [GET] http://localhost:8000/api/post/getHomePosts
// Data required: postId
export const getHomePosts = async (req, res) => {
  try {
    // const posts = await prisma.post.findMany();
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        postId: true,
        title: true,
        headline: true,
        frontImageUrl: true,
        authorId: true,
        likes: true,
        createdAt: true,
        updatedAt: true,

        // include comments with only the fields we want
        comments: {
          select: {
            commentId: true,
          },
        },

        // optionally include a small author object (instead of just authorId)
        author: {
          select: {
            authorId: true,
          },
        },
      },
    });
    return res.status(200).send(posts);
  } catch (ex) {
    console.log("Exception while fetching posts ...", ex);
    return res.status(500).send("Internal Server Error");
  }
};

// [GET] http://localhost:8000/api/post/getPost/{postId}
// Data required: postId
export const getPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await prisma.post.findUnique({
      // Use findUnique, not findFirst
      where: { postId },
      include: {
        comments: {
          include: {
            user: {
              select: {
                name: true,
                givenName: true,
                photoUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" }, // Latest comments first
        },
        author: {
          include: {
            generalDetails: {
              select: {
                name: true,
                givenName: true,
                photoUrl: true,
              },
            },
          },
        },
      },
    });

    if (post) return res.status(200).send(post);
    return res.status(404).send("Post Not Found");
  } catch (ex) {
    console.error("getPost error:", ex);
    return res.status(500).send("Internal Server Error");
  }
};

// [POST] http://localhost:8000/api/post/like
// Data required: not(postId)  ::  likes accroding to liked post stored in database
export const comment = async (req, res) => {
  const { postId, comment } = req.body;
  const googleId = req.user.sub;

  try {
    const user = await prisma.user.findUnique({
      where: { googleId },
      select: { userId: true },
    });

    if (!user) {
      return res.status(404).send("User not Logged in !");
    }

    const commentResponse = await prisma.comment.create({
      data: {
        comment,
        user: { connect: { userId: user.userId } },
        post: { connect: { postId } },
      },
      select: { commentId: true }, // return its primary thing
    });

    if (!commentResponse)
      return res.status(500).send("Error while adding comment");

    return res.status(201).send({
      success: true,
      message: "Commented !!",
    });
  } catch (ex) {
    console.error("Exception while updating comment:", ex);
    return res.status(500).send("Failed to update comment");
  }
};

// [POST] http://localhost:8000/api/post/editComment
// Data required: not(postId)  ::  likes accroding to liked post stored in database
export const editComment = async (req, res) => {
  const { commentId, comment: newComment } = req.body; // ✅ Renamed to avoid conflict
  const googleId = req.user.sub;

  try {
    const user = await prisma.user.findUnique({
      where: { googleId },
      select: { userId: true },
    });

    if (!user) {
      return res.status(404).send("User not logged in!");
    }

    // ✅ Renamed variable
    const existingComment = await prisma.comment.findUnique({
      where: { commentId },
      select: {
        userId: true,
        comment: true,
      },
    });

    if (!existingComment) {
      return res.status(404).send("Comment not found");
    }

    if (existingComment.userId !== user.userId) {
      return res.status(403).send("You can't edit others' comments");
    }

    const commentResponse = await prisma.comment.update({
      where: { commentId },
      data: {
        comment: newComment,
        updatedAt: new Date(),
      },
    });

    if (!commentResponse) {
      return res.status(500).send("Error while updating comment");
    }

    return res.status(200).send("Comment edited!");
  } catch (ex) {
    console.error("Exception while updating comment:", ex);
    return res.status(500).send("Failed to update comment");
  }
};

// [POST] http://localhost:8000/api/post/deleteComment
// Data required: not(postId)  ::  likes accroding to liked post stored in database
export const deleteComment = async (req, reply) => {
  const { commentId } = req.body;
  const googleId = req.user.sub;

  try {
    const user = await prisma.user.findUnique({
      where: { googleId },
      select: { userId: true },
    });

    if (!user) {
      return reply.code(404).send({ error: "User not logged in!" });
    }

    const comment = await prisma.comment.findUnique({
      where: { commentId },
      include: {
        user: {
          select: { googleId: true },
        },
      },
    });

    if (!comment) {
      return reply.code(404).send({ error: "Comment not found" });
    }

    if (comment.user.googleId !== googleId) {
      return reply
        .code(403)
        .send({ error: "You can't remove others' comments" });
    }

    await prisma.comment.delete({
      where: { commentId },
    });

    return reply.code(200).send({
      message: "Comment deleted successfully",
    });
  } catch (ex) {
    console.error("Exception while deleting comment:", ex);
    return reply.code(500).send({ error: "Failed to delete comment" });
  }
};
