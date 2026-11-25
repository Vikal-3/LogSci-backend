import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null // error bhi show kara sakte hai

//         console.log(
//   "CLOUD:", process.env.CLOUDINARY_CLOUD_NAME,
//   "KEY:", process.env.CLOUDINARY_API_KEY,
//   "SECRET_LEN:", process.env.CLOUDINARY_API_SECRET?.length
// );

        //upload the file on cloudinary
        const respone = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image"
        })
        //file has been uploaded successfull
        // console.log("file is uploaded successfull", respone.url)
        fs.unlinkSync(localFilePath)
        return respone;
    }
    catch (error) {
        console.log("Cloudinary upload error:", error);
        fs.unlinkSync(localFilePath)// remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary}