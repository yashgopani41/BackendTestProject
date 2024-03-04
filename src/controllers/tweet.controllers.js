import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import ApiError from "@/utils/apiError.js";
import ApiResponse from ".@/utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const createTweet = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;

    const userid = req.user._id;

    if (!content) {
      throw new ApiError(400, "Content is required");
    }

    const createTweet = await Tweet.create({
      content,
      owner: userid,
    });

    if (!createTweet) {
      throw new ApiError(400, "Problem in createTweet");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createTweet, "Tweet Created  Successfully"));
  } catch (error) {
    throw new ApiError(400, error.message || "Unable to create tweet");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      throw new ApiError(401, "You do not have permission to Read Tweets");
    }

    const allTweets = await Tweet.find({ owner: userId });

    if (!allTweets) {
      throw new ApiError(404, "No Tweets Found");
    }
    return res.status(200).json(new ApiResponse(200, allTweets, "Success"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Some error occurred getting tweets"
    );
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userid = req.user._id;

    const ownerDetails = await User.findById(userid).select("-content");

    if (!ownerDetails) {
      throw new ApiError(404, "User not found");
    }

    const updatTweet = await Tweet.updateOne(
      { _id: commentId },
      { $set: { content: content } }
    );
    if (!updatTweet) throw new ApiError(500, "Unable to update tweet");
    return res
      .status(200)
      .json(new ApiResponse(200, { updatTweet }, "Success"));
  } catch (error) {
    throw new ApiError(400, error.message || "You are not Authenticated");
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const ownerDetails = await User.findById(userId).select("-content");

    if (!ownerDetails) {
      throw new ApiError(404, "You are not Authenticated");
    }

    const deleteTweet = await Tweet.findByIdAndDelete(commentId);

    if (!deleteTweet) {
      throw new ApiError(404, "Unable to delete");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, deleteTweet, "Successfully Deleted"));
  } catch (error) {
    throw new ApiError(400, error.message || "problem in deleteTweet");
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
