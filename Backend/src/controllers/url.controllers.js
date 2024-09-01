import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import axios from "axios";
import { URLSearchParams } from "url";

const SAFE_BROWSING_API_KEY = process.env.API_KEY;
const SAFE_BROWSING_API_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find";
const checkUrl = asyncHandler(async (req, res, next) => {
    const { url } = req.body;
    console.log(url);
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

      // Log the entire response data for debugging purposes
      console.log("Response data:", response.data);
      
      // Determine if there are any matches indicating a threat
      const isPhishing = matches && Array.isArray(matches) && matches.length > 0;

    // Handle the case where response data is empty
    const isEmptyResponse = Object.keys(response.data).length === 0;

    // Prepare the response details based on whether threats were detected or if the response is empty
    const responseDetails = isEmptyResponse
      ? { isPhishing: false, details: 'No data received from the threat detection service' }
      : { isPhishing, details: isPhishing ? matches : 'No threats detected' };

    // Send the response using a structured API response format
    res.send(new ApiResponse(200, responseDetails));
});

export { checkUrl };
