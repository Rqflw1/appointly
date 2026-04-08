import { configDotenv } from "dotenv";
import type { NextConfig } from "next";

if (process.env.NODE_ENV === "development")
  configDotenv({ path: ".env.dev.local" });

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdfkit"]
};

export default nextConfig;
