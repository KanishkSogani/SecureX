import { Router } from "express";
import { checkUrl } from "../controllers/url.controllers.js";

const checkRouter = Router();

checkRouter.route("/check").post(checkUrl);

export { checkRouter };