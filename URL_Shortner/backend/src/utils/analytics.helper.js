const mongoose = require("mongoose");

const Analytics = require("../models/analytic.model");

const getAnalyticsStats = async (urlId, field) => {
    return await Analytics.aggregate([
        {
            $match: { urlId }
        },
        
        {
            $group:{
                _id:`${feild}`,
                count:{
                    $sum:1,
                }
            }
        },
        {
            $sort:{
                count:-1,
            }
        }
    ])
}

const dateFormat={
    day:"%y-%m-%d",
    week:"%Y-%U",
    month:"%Y-%m",
    year:"%Y"
}

module.exports={getAnalyticsStats, dateFormat};