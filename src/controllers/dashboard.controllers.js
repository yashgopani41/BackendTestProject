import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  try {
    const { userId } = req.params;
    const VideoData = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Schema.Types.ObjectId(userId),
        },
      },

      {
        $lookup: {
          from: "Likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },

      {
        $addFields: {
          totalLikes: {
            $size: { $ifNull: ["$likes", []] },
          },
        },
      },

      {
        $lookup: {
          from: "Subscribers",
          localField: "owner",
          foreignField: "channel",
          as: "subscribers",
        },
      },

      {
        $addFields: {
          totalSubscribers: {
            $size: { $ifNull: ["$subscribers", []] },
          },
        },
      },

      {
        $group: {
          _id: null,
          totalViews: {
            $sum: "$views",
          },
          totalLikes: {
            $sum: "$totalLikes",
          },
          totalVideos: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          owner: 0,
        },
      },
    ]);

    return res.status(200).json(new ApiResponse(200, { VideoData }, "Success"));
  } catch (error) {
    throw new ApiError(400, error.message || "Unable to get channel stats");
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  try {
    const { userId } = req.params;

    const allVideos = await Video.find({
      owner: new mongoose.Schema.Types.ObjectId(userId),
    });

    if (!allVideos) {
      throw new ApiError(401, "No videos found");
    }

    return res.status(200).json(new ApiResponse(200, { allVideos }, "Success"));
  } catch (error) {
    throw new ApiError(400, error.message || "Unable to get channel videos");
  }
});

export { getChannelStats, getChannelVideos };
