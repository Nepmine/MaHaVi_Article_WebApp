// import { PrismaClient } from "prisma/client";
import { PrismaClient } from '../generated/prisma/index.js'
// import { PrismaClient } from './generated/prisma'
// import { ObjectId } from 'bson'
import { ObjectId } from 'mongodb';

const prisma = new PrismaClient()

// [POST Protected] http://localhost:8000/api/post/createPost
// Data required: not(likes, authorId)
export const createPost = async (req, res) => {
    const userResponse = await prisma.user.findFirst({
        where: { googleId: req.body.googleId }
    })
    if (!userResponse) return res.status(403).send("Please Login First !!")

    req.body.likes = 0;
    req.body.authorId = userResponse.id;
    const response = await prisma.post.create({
        data: req.body
    })

    prisma.user.update({
        where: { email: req.user.googleId },
        data: {
            auther: { set: true }
        }
    });

    return res.status(200).send(response);
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
