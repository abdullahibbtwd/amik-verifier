import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  verifications: defineTable({
    status: v.string(),
    createdAt: v.number(),
  }),
});
