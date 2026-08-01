const analyticsService=require('../services/analytic.service');
const asyncHandler=require('../utils/asyncHandler');
const ApiResponse=require('../utils/ApiResponse');
const getOverview=asyncHandler(async(req,res)=>{
    const {urlId}=req.params;
    const userId=req.user._id;
    const { interval = "day" } = req.query;
    const overview=await analyticsService.getOverview(urlId,userId,interval);

    return res.status(200).json(
        new ApiResponse(200, overview, "Analytics overview fetched successfully")
    );
});

const getRecentClicks = asyncHandler(async (req, res) => {
    const { urlId } = req.params;
    const { limit = 20 } = req.query;

    // The service validates URL ownership and validates/caps the requested limit.
    const recentClicks = await analyticsService.getRecentClicks(urlId, req.user._id, limit);

    return res.status(200).json(
        new ApiResponse(200, recentClicks, "Recent clicks fetched successfully")
    );
});

module.exports={getOverview, getRecentClicks};
