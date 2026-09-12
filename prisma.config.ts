import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: "postgresql://neondb_owner:npg_Y9RixfW8dLKV@ep-divine-dew-aeyojpez-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
});
