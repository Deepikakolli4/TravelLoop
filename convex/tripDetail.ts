import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateTripDetail = mutation({
    args:{
        tripId: v.string(),
        uid: v.id('UserTable'),
        tripDetail: v.any()
    },
    handler:async(convexToJson,args) =>{
        const result = await convexToJson.db.insert('TripDetailTable',{
            tripDetail: args.tripDetail,
            tripId: args.tripId,
            uid: args.uid,
            isSaved: false,
            updatedAt: Date.now(),
        });

        return result;
    }
})

export const SaveTripPlan = mutation({
    args: {
        tripId: v.string(),
        uid: v.id('UserTable'),
        tripDetail: v.any()
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query('TripDetailTable')
            .filter((q) => q.and(
                q.eq(q.field('tripId'), args.tripId),
                q.eq(q.field('uid'), args.uid)
            ))
            .first();

        const now = Date.now();

        if (existing) {
            await ctx.db.patch(existing._id, {
                tripDetail: args.tripDetail,
                isSaved: true,
                savedAt: existing.savedAt ?? now,
                updatedAt: now,
            });

            return existing._id;
        }

        return await ctx.db.insert('TripDetailTable', {
            tripId: args.tripId,
            uid: args.uid,
            tripDetail: args.tripDetail,
            isSaved: true,
            savedAt: now,
            updatedAt: now,
        });
    }
})

export const GetSavedTripsByUser = query({
    args: {
        uid: v.id('UserTable')
    },
    handler: async (ctx, args) => {
        const rows = await ctx.db
            .query('TripDetailTable')
            .filter((q) => q.and(
                q.eq(q.field('uid'), args.uid),
                q.eq(q.field('isSaved'), true)
            ))
            .collect();

        return rows.sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0));
    }
})

export const GetSavedTripByTripId = query({
    args: {
        uid: v.id('UserTable'),
        tripId: v.string()
    },
    handler: async (ctx, args) => {
        const rows = await ctx.db
            .query('TripDetailTable')
            .filter((q) => q.and(
                q.eq(q.field('uid'), args.uid),
                q.eq(q.field('tripId'), args.tripId),
                q.eq(q.field('isSaved'), true)
            ))
            .collect();

        if (!rows.length) {
            return null;
        }

        return rows.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0];
    }
})

export const DeleteTripPlan = mutation({
    args: {
        tripDocId: v.id('TripDetailTable'),
        uid: v.id('UserTable')
    },
    handler: async (ctx, args) => {
        const row = await ctx.db.get(args.tripDocId);
        if (!row) {
            return false;
        }

        if (row.uid !== args.uid) {
            return false;
        }

        await ctx.db.delete(args.tripDocId);
        return true;
    }
})

export const CreateTripEvent = mutation({
    args: {
        tripId: v.string(),
        uid: v.optional(v.id('UserTable')),
        eventType: v.string(),
        entityType: v.string(),
        entityName: v.optional(v.string()),
        score: v.optional(v.number()),
        metadata: v.optional(v.any())
    },
    handler: async(ctx, args) => {
        return await ctx.db.insert('TripEventTable', {
            tripId: args.tripId,
            uid: args.uid,
            eventType: args.eventType,
            entityType: args.entityType,
            entityName: args.entityName,
            score: args.score,
            metadata: args.metadata,
            createdAt: Date.now()
        });
    }
})