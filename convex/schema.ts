import { defineSchema, defineTable} from "convex/server"
import { v } from "convex/values"
export default defineSchema({
    UserTable:defineTable({
        name: v.string(),
        imageUrl: v.string(),
        email: v.string(),
        subscription: v.optional(v.string()),
    }),
    TripDetailTable: defineTable({
        tripId: v.string(),
        tripDetail: v.any(),
        uid: v.id('UserTable'),
        isSaved: v.optional(v.boolean()),
        savedAt: v.optional(v.number()),
        updatedAt: v.optional(v.number())
    }),
    TripEventTable: defineTable({
        tripId: v.string(),
        uid: v.optional(v.id('UserTable')),
        eventType: v.string(),
        entityType: v.string(),
        entityName: v.optional(v.string()),
        score: v.optional(v.number()),
        metadata: v.optional(v.any()),
        createdAt: v.number()
    })
})