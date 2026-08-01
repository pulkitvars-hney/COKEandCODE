const mongoose = require("mongoose");
const Analytics = require("../models/analytic.model");

const dateFormat={
    day:"%y-%m-%d",
    week:"%Y-%U",
    month:"%Y-%m",
    year:"%Y"
}

module.exports={ dateFormat};