import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:commentId").patch(updateTweet).delete(deleteTweet);

export default router;
