import { asyncHandler } from "../utils/asyncHandler.js";

 console.log("Register controller called!");
const registerUser= asyncHandler( async(req,res)=>{
    res.status(200).json({
        message:"Logsci backend data on going"
    })
}); 

export {registerUser}