import { ping, userLogin, userDetails, myBlogs, myLikedPosts } from '../Controllers/userController.js';
import { auth } from '../Middlewares/auth.js'

const userSchema = {
  body: {
    type: 'object',
    required: ['googleId', 'email'],
    properties: {
      googleId: { type: 'string' },
      email: { type: 'string', format: 'email' },
      name: { type: 'string' },
      photoUrl: { type: 'string' },
      auther: { type: 'boolean' }
    }
  }
};

const loginSchema = {
  body: {
    type: 'object',
    required: ['token'],
    properties: {
      token: { type: 'string' }
    }
  }
};


export default async function (fastify, opts) {

  // [GET] http://localhost:8000/api/user/ping
  fastify.get('/ping', ping);

  // [POST] http://localhost:8000/api/user/userLogin
  fastify.post('/login', { preHandler: auth }, userLogin);


  // [GET] http://localhost:8000/api/user/protected/ping
  fastify.get('/userDetails', { preHandler: auth }, userDetails);


  // [GET] http://localhost:8000/api/user/protected/ping
  fastify.get('/myBlogs', { preHandler: auth }, myBlogs);

  // [GET] http://localhost:8000/api/user/protected/ping
  fastify.get('/myLikedPosts', { preHandler: auth }, myLikedPosts);
}