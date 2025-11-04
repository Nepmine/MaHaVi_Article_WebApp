import axios from "axios";

const axiosInstance = axios.create();

export const auth = async (req, reply) => {
  console.log("\nEntered in auth:::", req.headers);

  // Prefer Authorization header ID token first; fallback to cookie access token
  let token;
  let tokenType; // 'id' or 'access'

  const authHeader = req.headers?.authorization?.split(" ")[1];
  const cookieToken = req.cookies?.access_token;

  if (authHeader && authHeader.split(".").length === 3) {
    // Header contains ID token (JWT)
    token = authHeader;
    tokenType = "id";
  } else if (cookieToken) {
    // Cookie contains access token
    token = cookieToken;
    tokenType = "access";
  } else {
    console.log("\n[Error] No token found !!");
    return reply.status(401).send({ error: "Token is required !!" });
  }

  try {
    if (tokenType === "id") {
      // Verify ID token
      const response = await axiosInstance.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
      );

      // Make sure token audience matches your client ID
      if (response.data.aud !== process.env.GOOGLE_CLIENT_ID) {
        return reply.status(401).send({ error: "Invalid Google client ID" });
      }

      req.user = {
        sub: response.data.sub,
        email: response.data.email,
        email_verified: response.data.email_verified,
        name: response.data.name,
        picture: response.data.picture,
        given_name: response.data.given_name,
        family_name: response.data.family_name,
      };
    } else {
      // Access token: get user info
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

    console.log("\nUser authenticated successfully:", req.user);
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
