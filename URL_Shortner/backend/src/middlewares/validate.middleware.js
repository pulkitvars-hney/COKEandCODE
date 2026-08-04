const ApiError = require("../utils/ApiError");

// we are creating a middleware function as we will be providing a schema so we do not have to create indivual fuction for signup login et

// `source` lets the same middleware validate request bodies, route params, and queries.
function validate(schema, source = "body"){
    return (req,res,next)=>{
        const validationResult=schema.safeParse(req[source]);
        if(!validationResult.success){
            throw new ApiError(400,"Validation Error", validationResult.error.flatten());
        }
        // In Express 5, req.query is derived by a getter. Keep parsed query
        // values separately so defaults and coercions are retained reliably.
        if (source === "query") {
            req.validatedQuery = validationResult.data;
        } else {
            req[source]=validationResult.data;
        }
        next();
    }

}
module.exports={validate};
