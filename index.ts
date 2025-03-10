import { serve } from "bun";

interface UserInfo {
  user_id: number;
  has_subscription: boolean;
}

// Default mock database of users
const defaultTokenMap: Record<string, UserInfo> = {

};

// Load tokens from environment variables
function loadTokensFromEnv(): Record<string, UserInfo> {
  const tokenMap = { ...defaultTokenMap };
  
  // Try to load tokens from USER_TOKENS environment variable (JSON string)
  const userTokensEnv = process.env.USER_TOKENS;
  if (userTokensEnv) {
    try {
      const envTokens = JSON.parse(userTokensEnv);
      console.log("Loaded tokens from USER_TOKENS environment variable");
      Object.assign(tokenMap, envTokens);
    } catch (error) {
      console.error("Failed to parse USER_TOKENS environment variable:", error);
    }
  }
  
  // You can also load individual tokens from specific env vars
  const singleToken = process.env.VALID_TOKEN;
  const userId = process.env.USER_ID ? parseInt(process.env.USER_ID, 10) : null;
  const hasSubscription = process.env.HAS_SUBSCRIPTION === "true";
  
  if (singleToken && userId) {
    tokenMap[singleToken] = {
      user_id: userId,
      has_subscription: hasSubscription
    };
    console.log(`Loaded token from individual environment variables: ${singleToken}`);
  }
  
  return tokenMap;
}

// Initialize the userTokenMap with values from environment variables
const userTokenMap = loadTokensFromEnv();

// Log available tokens at startup
console.log(`Available tokens: ${Object.keys(userTokenMap).join(", ")}`);

const server = serve({
  port: 4090,
  async fetch(req) {
    // Log request details
    console.log({
      method: req.method,
      url: req.url,
      headers: req.headers,
    });

    try {
      // Only handle POST requests
      if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }

      // Parse form data
      const formData = await req.formData();
      const token = formData.get("token");

      console.log(`Received token: ${token}`);

      // Validate token
      if (!token) {
        return new Response(JSON.stringify({ error: "No token provided" }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Look up user by token
      const userInfo = userTokenMap[token.toString()];
      
      if (!userInfo) {
        return new Response(JSON.stringify({ error: "Invalid token" }), { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Return user info
      return new Response(JSON.stringify(userInfo), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
});

console.log(`User identification server listening on http://localhost:${server.port}`);