import mongoose, { Schema } from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    date: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      default: 'event',
      enum: ['event', 'announcement', 'reminder','meeting','deadline','exam','test','holiday'], // you can adjust these as needed
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Event || mongoose.model('Event', EventSchema)
