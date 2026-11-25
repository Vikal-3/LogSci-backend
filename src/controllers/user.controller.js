import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
  
//generate token method
const generateAccessAndRefreshTokens = async(userId)=>{
    try {
       const user =await User.findById(userId)
        const accessToken = user.generatedAccessToken();
         const refreshToken =user.generatedRefreshToken();
         user.refreshToken=refreshToken
         await user.save({validateBeforeSave: false})
         return{accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh token")
    }
}

//  console.log("Register controller called!");
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
    // console.log("req.body request:- " , req.body);
    console.log("email: " ,email);
    console.log("password: " ,password);

    //validation - no empty
    if (
        [fullName, email,username,password].some((filed)=> filed?.trim() === "")
    ) {
        throw new ApiError(400,"all fields are required")
    }

    //existed user  
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    }) 
  
    if(existedUser){
        throw new ApiError( 409 ,  "User with email or username already exists")
    }

    //check avatar , coverimage
    // console.log("request.files:- ", req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
     let coverImageLocalPath;
     if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path
     }

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is required");
    }
     
    //upload then to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
       
    //check avatar upload then cloudinary 
    if(!avatar){
        throw new ApiError(400,"Avatar file is required ")
    }

    //create user object  - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.secure_url, 
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

}) 

const loginUser = asyncHandler(async (req,res)=>{
    // i think but it's not correct way subtodo 
//[  
// take input the user the login page
//no empty
//username and email unique 
//cheack username or email in the mongodb and exists uername or email in database and after the  generate user ._id 
//no exists username or emial throw the error at apierror class used it in error throw 
//cheack the password in mongodb exists then not exist throw the error 
//password exists databased go to login aouthentication permisson 
// store the refress token and access token so i have no idea this time how to used token , session
//                                                                                                       ]
                        // ||||||||||||||||||||||||||||||||||||||||
// this is right way 
//[
//req.body ->data
//username

const {username , email , password} =req.body
 
if(!username || !email){
    throw new ApiError(400, "username or password is required")
}

   const user = await User.findOne({
    $or:[{username},{email}]
})

if(!user){
    throw new ApiError(404 , "user does not exist")
}

const isPasswordValid = await user.isPasswordCorrect(password)

if(!isPasswordValid){
    throw new ApiError(401, "Invalid user credentials ")
}


const {accessToken, refreshToken}=await generateAccessAndRefreshTokens(user._id);

const loggedInUser=User.findById(user._id).select("-password -refreshToken")

const options ={
    httpOnly:true,
    secure:true
}

return res
.status(200)
.cookie("accessToken" , accessToken , options)
.cookie("refreshToken" , refreshToken, options)
.json(
    new ApiResponse(
        200,
        {loggedInUser,refreshToken,accessToken},
        "User logged In Successfully"
    )
)
                                                                             

    

})

const logoutUser= asyncHandler(async(req,res)=>{
    const user =await  User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
     )
  const options = {
    httpOnly:true,
    secure:true
  }
  return res
         .status(200)
         .clearCookie("accessToken" , options)
         .clearCookie("refreshToken", options)
         .json(new ApiResponse( 200 , {}, "User Successfully Logged Out"))

})

export {registerUser , loginUser , logoutUser}