import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subcriptions.models.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  try {
    const conditions = { subscriber: userId, channel: channelId };
    const subscribed = await Subscription.findOne(conditions);

    if (!subscribed) {
      const createSubscription = await Subscription.create(conditions);
      return res
        .status(200)
        .json(new ApiResponse(200, { createSubscription }, "Subscribed"));
    } else {
      const deleteSubscription = await Subscription.deleteOne(conditions);

      return res
        .status(200)
        .json(new ApiResponse(200, { deleteSubscription }, "Unsubscribed"));
    }
  } catch (error) {
    throw new ApiError(400, error.message || "Unable to toggle subscription");
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  try {
    const allSubscribers = await Subscription.find({
      channel: channelId,
    });

    if (!allSubscribers) throw new ApiError(401, "No Subscribers found");

    return res
      .status(200)
      .json(new ApiResponse(200, { allSubscribers }, "Success"));
  } catch (error) {
    throw new ApiError(400, error.message || "Unable to get subscribers");
  }
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  try {
    const allSubscribedChannels = await Subscription.find({
      subscriber: subscriberId,
    });

    if (!allSubscribedChannels) throw new ApiError(401, "No Subscribers found");

    return res
      .status(200)
      .json(new ApiResponse(200, { allSubscribedChannels }, "Success"));
  } catch (error) {
    throw new ApiError(400, error.message || "Unable to get subscribers");
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
