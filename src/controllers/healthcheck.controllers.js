import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a

  return res.status(200).json(new ApiResponse(200, {}, "OK"));
});

export { healthcheck };
