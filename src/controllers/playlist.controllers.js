import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import ApiError from "@/utils/apiError.js";
import ApiResponse from "@/utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { videoId } = req.params;
  const userId = req.user._id;
  try {
    if (!name) throw new ApiError(404, "Name is Required filed");
    const createPlaylist = await Playlist.create({
      name,
      description,
      videos: videoId,
      owner: userId,
    });
    if (!createPlaylist) throw new ApiError(500, "Unable to create playlist");
    return res
      .status(200)
      .json(new ApiResponse(200, { createPlaylist }, "Success"));
  } catch (e) {
    throw new ApiError(400, e.message || "Unable to add Playlist");
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  try {
    if (!name) throw new ApiError(404, "Name is required");
    const updatePlaylist = await Playlist.updateOne(
      {
        _id: new mongoose.Schema.Types.ObjectId(playlistId),
      },
      { $set: { name: name, description: description } }
    );
    if (!updatePlaylist) throw new ApiError(500, "some error occurred");
    return res
      .status(200)
      .json(new ApiResponse(200, { updatePlaylist }, "success"));
  } catch (e) {
    throw new ApiError(400, e.message || "Unable to find Playlist");
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  try {
    const allPlaylists = await Playlist.find({
      owner: new mongoose.Schema.Types.ObjectId(userId),
    });
    if (!allPlaylists) throw new ApiError(401, "No Playlists found");
    return res
      .status(200)
      .json(new ApiResponse(200, { allPlaylists }, "Success"));
  } catch (e) {
    throw new ApiError(400, e.message || "Unable to find Playlist");
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  try {
    const allPlaylistsbyid = await Playlist.find({
      _id: new mongoose.Schema.Types.ObjectId(playlistId),
    });
    if (!allPlaylistsbyid) throw new ApiError(401, "No Playlists found");
    return res
      .status(200)
      .json(new ApiResponse(200, { allPlaylistsbyid }, "Success"));
  } catch (e) {
    throw new ApiError(400, e.message || "Unable to find Playlist");
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  try {
    const removeVideoFromPlaylistRequest = await Playlist.updateOne(
      {
        _id: new mongoose.Schema.Types.ObjectId(playlistId),
      },
      { $pull: { videos: new mongoose.Schema.Types.ObjectId(videoId) } }
    );
    if (!removeVideoFromPlaylistRequest)
      throw new ApiError(500, "Unable to update playlist");
    if (removeVideoFromPlaylistRequest) {
      await deleteOnCloudinary(
        removeVideoFromPlaylistRequest.videos[0],
        "video"
      );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { removeVideoFromPlaylistRequest }, "Success")
      );
  } catch (e) {
    throw new ApiError(400, e.message || "Unable to find Playlist");
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  try {
    const deletePlaylistRequest = await Playlist.findByIdAndDelete(
      new mongoose.Schema.Types.ObjectId(playlistId)
    );
    if (!deletePlaylistRequest)
      throw new ApiError(500, "Unbale to deleted playlist");
    return res
      .status(200)
      .json(new ApiResponse(200, { deletePlaylistRequest }, "Success"));
  } catch (e) {
    throw new ApiError(400, e.message || "Unable to delete playlist");
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
