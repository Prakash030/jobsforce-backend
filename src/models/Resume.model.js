import mongoose, { Schema } from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  s3Url: {
    type: String,
    required: true,
  },
  extractedSkills: [{ type: String }],
  extractedText: {
    type: String
  },
  interestedDomain: {
    type: String,
  },
  originalFileName: {
    type: String,
    required: true
  },
}, { timestamps: true });

const Resume = mongoose.model('resume', ResumeSchema);

export default Resume;