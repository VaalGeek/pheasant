import mongoose, { Schema } from 'mongoose';

const NewsletterSchema = new mongoose.Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 200,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
)

export default mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema)
