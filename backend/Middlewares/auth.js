import axios from "axios";

const axiosInstance = axios.create();

export const auth = async (req, reply) => {
  console.log("\nEntered in auth:::", req.headers);

  const token =
    req.cookies?.access_token || req.headers?.authorization?.split(" ")[1];

  if (!token) {
    console.log("\n[Error] No token found !!");
    return reply.status(401).send({ error: "Token is required !!" });
  }

  try {
    // Check if it's a JWT (ID token)
    if (token.split(".").length === 3) {
      // It's an ID token - verify it with Google
      const response = await axiosInstance.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
      );

      // Extract user info from verified token
      req.user = {
        sub: response.data.sub,
        email: response.data.email,
        email_verified: response.data.email_verified,
        name: response.data.name,
        picture: response.data.picture,
        given_name: response.data.given_name,
        family_name: response.data.family_name,
      };
      console.log("\nEnd of the auth:::::::::");
    } else {
      // It's an access token - use userinfo endpoint
      const authResponse = await axiosInstance.get(
        `https://www.googleapis.com/oauth2/v3/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      req.user = authResponse.data;
    }
  } catch (error) {
    console.error(
      "\nGoogle token validation failed:",
      error.response?.data || error.message
    );
    return reply.status(401).send({
      error: "Invalid Google token",
      details: error.response?.data,
    });
  }
};
