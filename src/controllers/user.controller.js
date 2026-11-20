import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
 
 console.log("Register controller called!");
const registerUser= asyncHandler( async(req,res)=>{
    // user details 
    // no empty
    // all ready exists username , email
    // check avatar , coverimage 
    // upload then to cloudinary
    // check avatar upload then cloudinary 
    // create user object  - create entry in db
    // remove password and refresh token filed from response 
    // check for  user creation 
    // return response 


    //user details
    const {fullName, username , email, password }= req.body
    console.log("email: " ,email);

    //validation - no empty
    if (
        [fullName, email,username,password].some((filed)=> filed?.trim() === "")
    ) {
        throw new ApiError(400,"all fields are required")
    }

    //existed user  
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
  
    if(existedUser){
        throw new ApiError( 409 ,  "User with email or username already exists")
    }
    //check avatar , coverimage
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is required");
    }
     
    //upload then to cloudinary
    const avatar = uploadOnCloudinary(avatarLocalPath);
    const coverImage = uploadOnCloudinary(coverImageLocalPath);
       
    //check avatar upload then cloudinary 
    if(!avatar){
        throw new ApiError(400,"Avatar file is required ")
    }

    //create user object  - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
     
    //cheack create the user and remove the password , refreshToken
    const createdUser = await User.findById(user).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500 ,"Something went wrong while registering the user") 
    }
    
    return res.status(201).json(
        new ApiResponse( 200 , createdUser , "User registered Successfully")
    )

}); 

export {registerUser}