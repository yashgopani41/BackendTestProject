import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.id.toString();
  try {
    const toggleVideoLikeCondition = { LikedBy: userId, video: videoId };
    const toggleVideo = await Like.findOne(toggleVideoLikeCondition);
    if (!toggleVideo) {
      const createLike = await Like.create(toggleVideoLikeCondition);
      return res
        .status(200)
        .json(new ApiResponse(200, { createLike }, "Success"));
    } else {
      const removeLike = await Like.findOneAndDelete(toggleVideo);
      return res
        .status(200)
        .json(new ApiResponse(200, { removeLike }, "Success"));
    }
  } catch (e) {
    throw new ApiError(400, e.message || "toggleVideoLike");
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.id.toString();
  try {
    const likedCommentCondition = { LikedBy: userId, video: videoId };
    const LikedComment = await Like.findOne(likedCommentCondition);
    if (!LikedComment) {
      const createCommentLike = await Like.create({ LikedComment });

      return res
        .status(201)
        .json(
          new ApiResponse(201, createCommentLike, "Comment Liked Successfully")
        );
    }
    const deleteCommentLike = await Like.findByIdAndDelete(LikedComment._id);

    return res
      .status(200)
      .json(new ApiResponse(200, deleteCommentLike, "Comment Like Deleted"));
  } catch (error) {
    throw new ApiError(500, error.message || "problem in toggleCommentLike");
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.id.toString();
  try {
    const likedTweetCondition = { LikedBy: userId, video: videoId };
    const LikedTweet = await Like.findOne(likedTweetCondition);
    if (!LikedTweet) {
      const createCommentLike = await Like.create({ LikedTweet });

      return res
        .status(201)
        .json(
          new ApiResponse(201, createCommentLike, "Comment Liked Successfully")
        );
    }
    const deleteCommentLike = await Like.findByIdAndDelete(LikedTweet._id);

    return res
      .status(200)
      .json(new ApiResponse(200, deleteCommentLike, "Comment Like Deleted"));
  } catch (error) {
    throw new ApiError(500, error.message || "problem in toggleTweetLike");
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user.id.toString();
  try {
    const allLiked = await Like.find({
      LikedBy: userId,
      video: { $exists: true },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { allLiked }, "Successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "problem in getLikedVideos");
  }
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
