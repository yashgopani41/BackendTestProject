
const asyncHandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next))
        .catch((error)=> next(error))
    }
}

export default asyncHandler;

// OR

// const asyncHandler = (fn) =>async (req,res,next) => {
//     try {
//         await fn(req,req,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }