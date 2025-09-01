// import { PrismaClient } from "prisma/client";
import { PrismaClient } from '../generated/prisma/index.js'
// import { PrismaClient } from './generated/prisma'

const prisma = new PrismaClient()

// [GET] http://localhost:8000/api/user/ping
export const ping = async (req, res) => {
  var response = await prisma.user.findFirst({
    where: { googleId: '123456643' }
  })

  res.status(200).send(response);
};

// [GET] http://localhost:8000/api/user/userDetails
export const userDetails = async (req, res) => {
  var response = await prisma.user.findFirst({
    where: { googleId: req.user.googleId }
  })
  res.status(200).send(response);
};

// [GET] http://localhost:8000/api/user/userLogin
export const userLogin = async (req, res) => {
  if (!req.user?.email_verified)
    return res.status(401).send("User not signed in or invalid token !!")
  const { sub, email, name, given_name, picture } = req.user;
  const response = await prisma.user.findUnique({
    where: {
      googleId: sub
    }
  });
  if (response) return res.status(200).send("User Exists...");
  const dbResponse = await prisma.user.create({
    data: {
      googleId: sub,
      email,
      name,
      givenName: given_name,
      photoUrl: picture
    }
  })
  return res.status(201).send("User Created !");
};



// [GET] http://localhost:8000/api/user/myBlogs
export const myBlogs = async (req, res) => {
  console.log("Came here .....", req)
  console.log("Came here .....", req.body)
  const userEmail = req.user.email;

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, posts: true }
  });

  if (user)
    if (user.posts) return res.status(200).send(user.posts)
    else return res.status(404).send("No Posts Found ")
  else return res.status(404).send("No User Found ")
};



// [GET] http://localhost:8000/api/user/myLikedPosts
export const myLikedPosts = async (req, res) => {

  const userEmail = req.user.email;

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, likedPosts: true }
  });

  if (user)
    if (user.likedPosts) return res.status(200).send(user.likedPosts)
    else return res.status(404).send("No likedPosts Found ")
  else return res.status(404).send("No User Found ")
};


