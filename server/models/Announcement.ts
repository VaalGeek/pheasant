
import mongoose, { Schema } from 'mongoose';
const AnnouncementSchema = new mongoose.Schema({
  schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  category: { type: String, required: true, default:'Annoucement' },
  pinned: { type: Boolean, default: false },
  link: { type: String },
  linkLabel: { type: String }
})

export const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema)
