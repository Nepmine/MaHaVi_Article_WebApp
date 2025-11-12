import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

// [GET] http://localhost:8000/api/user/userDetails
export const userDetails = async (req, res) => {
  var response = await prisma.user.findFirst({
    where: { googleId: req.user.sub },
  });
  res.status(200).send(response);
};

// [GET] http://localhost:8000/api/user/userLogin
export const userLogin = async (req, res) => {
  if (!req.user?.email_verified)
    return res.status(401).send("User not signed in or invalid token !!");
  const { sub, email, name, given_name, picture } = req.user;
  const response = await prisma.user.findUnique({
    where: {
      googleId: sub,
    },
    select: {
      userId: true,
      givenName: true,
    },
  });
  if (response)
    // return res.status(200).send(req.headers?.authorization?.split(" ")[1]);
    return res.status(200).send({
      token: req.headers?.authorization?.split(" ")[1],
      message: "Login successful",
    });
  const dbResponse = await prisma.user.create({
    data: {
      googleId: sub,
      email,
      name,
      givenName: given_name,
      photoUrl: picture,
    },
  });
  return res.status(201).send({
    token: req.headers?.authorization?.split(" ")[1],
    message: "Signup successful",
  });
  // return res.status(201).send("User Created !");
};

// [POST] http://localhost:8000/api/user/makeAuthor
export const makeAuthor = async (req, res) => {
  if (!req.user?.email_verified) {
    return res.status(401).send("User not signed in or invalid token !!");
  }

  const { secret, authorEmail } = req.body;

  if (secret !== process.env.AUTHOR_SECRET) {
    return res.status(403).send("Unauthorized !!");
  }

  try {
    // 1. Find or create the user
    let user = await prisma.user.findFirst({
      where: { email: authorEmail },
    });

    if (!user) return res.status(404).send("User not found !");

    // 2. Find or create the author linked to this user
    const author = await prisma.author.upsert({
      where: { userId: user.userId },
      update: {},
      create: {
        userId: user.userId,
      },
    });

    return res.status(200).send({
      userId: user.userId,
      authorId: author.authorId,
      message: "Author assigned successfully",
    });
  } catch (err) {
    console.error("Error creating author:", err);
    return res.status(500).send("Internal Server Error");
  }
};

// By author
// [GET] http://localhost:8000/api/user/myBlogs
export const myBlogs = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { googleId: req.user.sub },
      select: {
        authorProfile: {
          select: {
            posts: {
              select: {
                postId: true,
                title: true,
                frontImageUrl: true,
                headline: true,
                likes: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    // Changed from userPosts to user ✅
    if (!user?.authorProfile) {
      return res.status(403).send("Access Denied - Not an author");
    }

    if (!user.authorProfile.posts || user.authorProfile.posts.length === 0) {
      return res.status(404).send("No Posts Found");
    }

    return res.status(200).send(user.authorProfile.posts);
  } catch (error) {
    console.error("myBlogs error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

// [GET] http://localhost:8000/api/user/myLikedPosts
export const myLikedPosts = async (req, res) => {
  try {
    const googleId = req.user.sub;

    const user = await prisma.user.findUnique({
      where: { googleId },
      select: {
        userId: true,
        likedPosts: {
          select: {
            postId: true,
            title: true,
            headline: true,
            frontImageUrl: true,
            likes: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).send("No User Found");
    }

    if (!user.likedPosts || user.likedPosts.length === 0) {
      return res.status(404).send("No Liked Posts Found");
    }

    return res.status(200).send(user.likedPosts);
  } catch (error) {
    console.error("myLikedPosts error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

// [GET] http://localhost:8000/api/user/myLikedPosts
export const isAuthor = async (req, res) => {
  try {
    const googleId = req.user.sub;

    const user = await prisma.user.findUnique({
      where: { googleId },
      include: { authorProfile: true },
    });

    if (!user) {
      return res.status(404).send("No User Found");
    } else if (!user.authorProfile) {
      return res.status(200).send(false);
    }

    return res.status(200).send(true);
  } catch (error) {
    console.error("Error in IsAuthor:", error);
    return res.status(500).send("Internal Server Error");
  }
};
