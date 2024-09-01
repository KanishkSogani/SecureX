import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import axios from "axios";
import { URLSearchParams } from "url";

const SAFE_BROWSING_API_KEY = process.env.API_KEY;
const SAFE_BROWSING_API_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find";
const checkUrl = asyncHandler(async (req, res, next) => {
    const { url } = req.body;
    if (!url) {
        return next(new ApiError(400, "Url is required"));
    }
    const response = await axios.post(
        `${SAFE_BROWSING_API_URL}?key=${SAFE_BROWSING_API_KEY}`,
        {
            client: {
              clientId: 'securex-434215',
              clientVersion: '1.0.0'
            },
            threatInfo: {
              threatTypes: ['SOCIAL_ENGINEERING', 'MALWARE'],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: [{ url: url }]
            }
          }
      );


    const { matches } = response.data;
    // console.log(response.data)
    const isPhishing = matches && matches.length > 0;
    res.send(new ApiResponse(200, { isPhishing , details: isPhishing ? matches : 'No threats detected' }));
});

export { checkUrl };
