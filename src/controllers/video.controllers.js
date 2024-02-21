import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinaryService.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const pipeline = [];

  // Match stage for filtering by userId
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById({ _id: userId });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user) {
    pipeline.push({
      $match: {
        owner: new mongoose.Schema.Types.ObjectId(userId),
      },
    });

    // Match stage for based on text query

    if (query) {
      pipeline.push({
        $match: {
          $or: [
            {
              title: {
                $regex: query,
                $options: "i",
              },

              description: {
                $regex: query,
                $options: "i",
              },
            },
          ],
        },
      });
    }

    // Sort

    if (sortBy && sortType) {
      const sortTypeValue = sortType === "desc" ? -1 : 1;
      pipeline.push({
        $sort: { [sortBy]: sortTypeValue },
      });
    }

    // populate the owner field

    pipeline.push({
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    });
    pipeline.push({
      $project: {
        username: 1,
        email: 1,
        avatar: 1,
      },
    });
    // add the calculated owner field to the pipeline

    pipeline.push({
      $addFields: {
        $first: "$owner",
      },
    });

    const aggregate = await Video.aggregate(pipeline);

    Video.aggregatePaginate(aggregate, { page, limit })
      .then((video) => {
        return res
          .status(200)
          .json(new ApiResponse(200, { video }, "Fetched videos successfully"));
      })
      .catch((error) => {
        throw error;
      });
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  // Check if any field is empty
  if (![title, description].every(Boolean)) {
    throw new ApiError(400, "All fields are required!");
  }

  // upload video & thumbnail on cloudinary
  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video is missing!");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail is missing!");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) {
    throw new ApiError(500, "Failed to upload video!, try again");
  }

  if (!thumbnail) {
    throw new ApiError(500, "Failed to upload thumbnail!, try again");
  }

  // save video details in db
  const video = await Video.create({
    videoFile: { key: videoFile?.public_id, url: videoFile?.url },
    thumbnail: { key: thumbnail?.public_id, url: thumbnail?.url },
    title,
    description,
    duration: videoFile?.duration,
    owner: req.user._id,
    isPublished,
  });
  console.log("🚀 ~ publishAVideo ~ video:", video);

  if (!video) {
    throw new ApiError(
      500,
      "Something went wrong while uploading video, try again"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "Video uploaded successfully!"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Schema.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    pipeline([
      {
        $project: {
          username: 1,
          email: 1,
          avatar: 1,
        },
      },
    ]),
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { video: video[0] },
        "Video Fetched Successfully",
        video
      )
    );
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, thumbnail } = req.body;
  //TODO: update video details like title, description, thumbnail

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const videoLocalPath = req.file?.videoFile[0]?.path;
  const thumbnailLocalPath = req.file?.thumbNail[0]?.path;

  if (!videoLocalPath && !thumbnailLocalPath) {
    throw new ApiError(400, "Please provide a video file or thumbnail");
  }

  const videoUrl = await uploadOnCloudinary(videoLocalPath);
  const thumbNailUrl = await uploadOnCloudinary(thumbnailLocalPath);

  const updatedVideo = await Video.findByIdAndUpdate(
    { _id: videoId },
    {
      $set: {
        videoFile: { public_id: videoUrl?.public_id, url: videoUrl?.url },
      },
      $set: {
        thumbnail: {
          public_id: thumbNailUrl?.public_id,
          url: thumbNailUrl?.url,
        },
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { video: updatedVideo },
        "Video  Updated Successfully"
      )
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findByIdAndDelete({ _id: videoId });
  console.log("🚀 ~ deleteVideo ~ video:", video);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Delete video & thumbnail from cloudinary
  if (video.videoFile) {
    await deleteOnCloudinary(video.videoFile.key, "video");
  }

  if (video.thumbnail) {
    await deleteOnCloudinary(video.thumbnail.key);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findByIdAndUpdate({ _id: videoId });

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;

  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Video Toggle Status Updated Successfully",
        video
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
