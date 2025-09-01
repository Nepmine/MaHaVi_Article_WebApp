import axios from 'axios';
import https from 'https';

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // ❗ disables SSL cert check
  }),
});

export const auth = async (req, res) => {
  const accessToken = req.cookies?.access_token
  console.log("\n Inside auth::", req.cookies, "Access token:", accessToken)
  if (accessToken) {
    try {
      const authResponse = await axiosInstance.get(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
      );
      console.log("\n response from token:", authResponse.data)
      req.user = authResponse.data;
    } catch (error) {
      console.error('\n Google token validation failed:', error.response?.data || error.message);
      res.status(401).send('Invalid Google access token');
    }
  }
  else {
    return res.status(401).send("Access token is required !!")
  }
}