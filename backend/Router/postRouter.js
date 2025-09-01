import { createPost, likePost, getHomePosts } from '../Controllers/postController.js';
import { auth } from '../Middlewares/auth.js'
import fastifyMultipart from "@fastify/multipart";



const postSchema = {
    body: {
        type: 'object',
        required: ['title', 'article'],
        properties: {
            title: { type: 'string' },
            imageUrl: { type: 'string' },  // for now, it is to be sent by frontend using firebase !!
            headline: { type: 'string' },
            article: { type: 'string' },
            authorId: { type: 'string' },
            likes: { type: 'integer' },   // might cause error in the future !!
        }
    }
};

const likeSchema = {
    body: {
        type: 'object',
        required: ['postId'],
        properties: {
            postId: { type: 'string' },
        }
    }
}


export default async function (fastify, opts) {

    // // [GET] http://localhost:8000/api/ping
    // fastify.get('/ping', ping);

    // // [POST] http://localhost:8000/api/userLogin
    // fastify.post('/login', { schema: loginRequestSchema }, userLogin);


    // // [GET] http://localhost:8000/api/protected/ping
    // fastify.get('/userDetails', { preHandler: auth }, userDetails);



    // [POST Protected] http://localhost:8000/api/post/post
    // fastify.post('/createPost', { preHandler: auth }, createPost);
  fastify.register(fastifyMultipart);

  // [POST] create post (with auth + file upload)
  fastify.post("/createPost", { preHandler: auth }, createPost);

    // [POST Protected] http://localhost:8000/api/post/post
    fastify.post('/likePost', { preHandler: auth, schema: likeSchema }, likePost);

    // [GET Protected] http://localhost:8000/api/post/getHomePosts
    fastify.get('/getHomePosts', getHomePosts);
} 