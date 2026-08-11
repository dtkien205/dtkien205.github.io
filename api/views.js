import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

function isValidPath(path) {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    path.length <= 300
  );
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    if (req.method === "POST" && Array.isArray(req.body?.paths)) {
      const paths = [...new Set(req.body.paths)];

      if (
        paths.length === 0 ||
        paths.length > 200 ||
        paths.some((path) => !isValidPath(path))
      ) {
        return res.status(400).json({
          error: "Invalid paths",
        });
      }

      const values = await redis.mget(...paths.map((path) => `views:${path}`));
      const views = Object.fromEntries(
        paths.map((path, index) => [path, Number(values[index] || 0)])
      );

      return res.status(200).json({
        views,
      });
    }

    const path = req.method === "GET" ? req.query.path : req.body?.path;

    if (!isValidPath(path)) {
      return res.status(400).json({
        error: "Invalid path",
      });
    }

    const key = `views:${path}`;
    const views =
      req.method === "POST"
        ? await redis.incr(key)
        : Number((await redis.get(key)) || 0);

    return res.status(200).json({
      views,
    });
  } catch (error) {
    console.error("View counter error:", error);

    return res.status(500).json({
      error: "Failed to update views",
    });
  }
}
