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
    const { type } = req.params;
    const userResponse = await prisma.user.findFirst({
      where: { googleId: req.user.sub },
      include: { authorProfile: true },
    });

    if (!userResponse) return reply.code(403).send("Please Login First !!");
    if (!userResponse.authorProfile)
      return reply.code(401).send("You don't have permission !!");

    // [Modified] Parse and normalize content (array of segments)
    const { title, headline, frontImageUrl, content, category } = req.body;

    // [Modified] Save post with proper schema mapping
    const serverResponse = await prisma.post.create({
      data: {
        title,
        headline,
        frontImageUrl,
        content, // [Modified] use updated segments, not original content
        author: { connect: { authorId: userResponse.authorProfile.authorId } }, // [Added] connect post to author
        article: type == "article",
        category,
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

// [POST Protected] http://localhost:8000/api/post/createGallery
// Data required: images
export const createGallery = async (req, reply) => {
  try {
    const userResponse = await prisma.user.findFirst({
      where: { googleId: req.user.sub },
      include: { authorProfile: true },
    });

    if (!userResponse) return reply.code(403).send("Please Login First !!");
    if (!userResponse.authorProfile)
      return reply.code(401).send("You don't have permission !!");

    const { images } = req.body; // expecting array of URLs

    if (!images || !Array.isArray(images) || images.length === 0) {
      return reply.code(400).send("Images array is required");
    }

    const newGallery = await prisma.gallery.create({
      data: {
        images,
        author: { connect: { authorId: userResponse.authorProfile.authorId } },
      },
    });

    return reply.code(200).send(newGallery);
  } catch (error) {
    console.error("Prisma/Gallery creation error:", error);
    return reply.code(500).send({
      error: "Failed to create gallery",
      message: error.message,
      stack: error.stack,
    });
  }
};

// [GET] http://localhost:8000/api/post/getAllGalleries
export const getAllGalleries = async (req, reply) => {
  try {
    const galleries = await prisma.gallery.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          include: {
            generalDetails: {
              select: {
                name: true,
                photoUrl: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!galleries || galleries.length === 0) {
      return reply.code(404).send("No galleries found");
    }

    return reply.code(200).send(galleries);
  } catch (error) {
    console.error("Prisma/Get galleries error:", error);
    return reply.code(500).send({
      error: "Failed to fetch galleries",
      message: error.message,
    });
  }
};

export const likeGallery = async (req, reply) => {
  const { galleryId } = req.body;
  const googleId = req.user.sub;

  try {
    const user = await prisma.user.findUnique({
      where: { googleId },
      select: { userId: true },
    });

    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    const gallery = await prisma.gallery.findUnique({
      where: { galleryId },
      select: { likes: true },
    });

    if (!gallery) {
      return reply.code(404).send({ error: "Gallery not found" });
    }

    // Check if user has already liked this gallery
    const existingLike = await prisma.galleryLike.findFirst({
      where: { galleryId, userId: user.userId },
    });

    let updatedGallery;

    if (existingLike) {
      // Unlike
      await prisma.galleryLike.delete({
        where: { id: existingLike.id },
      });

      updatedGallery = await prisma.gallery.update({
        where: { galleryId },
        data: { likes: { decrement: 1 } },
        select: { likes: true },
      });

      return reply.code(200).send({
        message: "Unliked",
        likes: updatedGallery.likes,
      });
    } else {
      // Like
      await prisma.galleryLike.create({
        data: { userId: user.userId, galleryId },
      });

      updatedGallery = await prisma.gallery.update({
        where: { galleryId },
        data: { likes: { increment: 1 } },
        select: { likes: true },
      });

      return reply.code(200).send({
        message: "Liked",
        likes: updatedGallery.likes,
      });
    }
  } catch (error) {
    console.error("Gallery like error:", error);
    return reply.code(500).send({
      error: "Failed to update like status",
      details: error.message,
    });
  }
};

// [DELETE] http://localhost:8000/api/post/deleteGallery/:galleryId
export const deleteGallery = async (req, reply) => {
  try {
    const { galleryId } = req.params;

    const gallery = await prisma.gallery.findUnique({
      where: { galleryId },
    });

    if (!gallery) {
      return reply.code(404).send({ error: "No gallery found with that ID" });
    }

    const deletedGallery = await prisma.gallery.delete({
      where: { galleryId },
    });

    await prisma.galleryLike.deleteMany({
      where: { galleryId },
    });

    return reply.code(200).send({
      message: "Gallery deleted successfully",
      deletedGallery,
    });
  } catch (error) {
    console.error("Prisma/Delete gallery error:", error);
    return reply.code(500).send({
      error: "Failed to delete gallery",
      message: error.message,
    });
  }
};

// [DELETE] /api/post/deleteGalleryImage/:galleryId
export const deleteGalleryImage = async (req, reply) => {
  try {
    const { galleryId } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return reply.code(400).send({ message: "Image URL is required" });
    }

    // Step 1: Fetch the gallery
    const gallery = await prisma.gallery.findUnique({
      where: { galleryId },
    });

    if (!gallery) {
      return reply.code(404).send({ message: "No gallery found with that ID" });
    }

    // Step 2: Check if the image exists in the array
    if (!gallery.images.includes(imageUrl)) {
      return reply
        .code(404)
        .send({ message: "Image not found in this gallery" });
    }

    // Step 3: Remove that image from the array
    const updatedImages = gallery.images.filter((img) => img !== imageUrl);

    // Step 4: Update the gallery record
    const updatedGallery = await prisma.gallery.update({
      where: { galleryId },
      data: { images: updatedImages },
    });

    // Step 5: Return success
    return reply.code(200).send({
      message: "Image deleted successfully",
      updatedGallery,
    });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return reply.code(500).send({
      error: "Failed to delete image",
      message: error.message,
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
    const { postId, title, headline, frontImageUrl, content, category } =
      req.body;

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
        category,
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
        trending: true,
        category: true,

        // include comments with only the fields we want
        comments: {
          select: {
            commentId: true,
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

// [GET] http://localhost:8000/api/post/deleteComment
// Data required: not(postId)  ::  likes accroding to liked post stored in database
export const allTrendings = async (req, reply) => {
  try {
    const posts = await prisma.post.findMany({
      where: { trending: true },
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
        trending: true,
        comments: { select: { commentId: true } },
        author: { select: { authorId: true } },
      },
    });
    return reply.status(200).send(posts); // [Modified] changed res → reply
  } catch (ex) {
    console.log("Exception while fetching trending posts ...", ex);
    return reply
      .status(500)
      .send("Internal Server Error fetching trending posts"); // [Modified]
  }
};

// [post] http://localhost:8000/api/post/addTrending/{postId}
// Data required: not(postId)  ::  likes accroding to liked post stored in database
export const addTrending = async (req, reply) => {
  try {
    const { postId } = req.params;
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

    const isOwner = userResponse.authorProfile.posts.some(
      (post) => post.postId === postId
    );
    if (!isOwner)
      return reply.code(403).send("Only owner can modify trending !!");

    await prisma.post.update({
      where: { postId },
      data: { trending: true },
    });
    return reply.status(200).send({ success: true, postId });
  } catch (ex) {
    console.log("Exception while adding to trending ...", ex);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

// [post] http://localhost:8000/api/post/removeTrending/{postId}
// Data required: not(postId)  ::  likes accroding to liked post stored in database
export const removeTrending = async (req, reply) => {
  try {
    const { postId } = req.params;

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

    if (!userResponse)
      return reply.code(403).send({ error: "Please Login First !!" });
    if (!userResponse.authorProfile)
      return reply.code(401).send({ error: "You don't have permission !!" });

    const isOwner = userResponse.authorProfile.posts.some(
      (post) => post.postId === postId
    );
    if (!isOwner)
      return reply
        .code(403)
        .send({ error: "Only owner can modify trending !!" });

    await prisma.post.update({
      where: { postId },
      data: { trending: false },
    });

    // ✅ Return JSON object instead of plain string
    return reply.status(200).send({ success: true, postId });
  } catch (ex) {
    console.log("Exception while removing from trending ...", ex);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

// [GET] http://localhost:8000/api/post/allArticles
// Data required: not(postId)  ::  likes accroding to liked post stored in database
export const allArticles = async (req, reply) => {
  try {
    const posts = await prisma.post.findMany({
      where: { article: true },
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
        trending: true,
        comments: { select: { commentId: true } },
        author: { select: { authorId: true } },
      },
    });
    return reply.status(200).send(posts); // [Modified] changed res → reply
  } catch (ex) {
    console.log("Exception while fetching articles ...", ex);
    return reply.status(500).send("Internal Server Error fetching articles"); // [Modified]
  }
};

// [GET] http://localhost:8000/api/post/getRecentNews/{recentCount}
// Data required: not(postId)  ::  likes accroding to liked post stored in database
export const getRecentNews = async (req, reply) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        postId: true,
        title: true,
        headline: true,
        frontImageUrl: true,
        createdAt: true,
      },
      take: parseInt(req.params.recentCount) || 3,
    });
    return reply.status(200).send(posts); // [Modified] changed res → reply
  } catch (ex) {
    console.log("Exception while fetching recent articles ...", ex);
    return reply.status(500).send("Internal Server Error fetching articles"); // [Modified]
  }
};

// [GET] http://localhost:8000/api/post/getCategory/{category}
// Data required: not(postId)  ::  likes accroding to liked post stored in database
export const getCategory = async (req, reply) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        category: {
          has: req.params.category,
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        postId: true,
        title: true,
        headline: true,
        frontImageUrl: true,
        likes: true,
        createdAt: true,
      },
    });
    return reply.status(200).send(posts); // [Modified] changed res → reply
  } catch (ex) {
    console.log("Exception while fetching articles ...", ex);
    return reply.status(500).send("Internal Server Error fetching articles"); // [Modified]
  }
};
