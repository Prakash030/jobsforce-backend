import pkg from 'aws-sdk';
const { S3 } = pkg;

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});


export const uploadToS3 = async (file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype
  };  
  
  try {
    const uploaded = await s3.upload(params).promise();
    return uploaded.Location;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};