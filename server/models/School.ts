// models/School.ts or models/School.js

import mongoose from 'mongoose'

const SchoolSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Primary', 'Secondary', 'Combined', 'Other'], // Optional: limit school types
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  emis: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  userId: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true // adds createdAt and updatedAt
})

// Only register the model once
export default mongoose.models.School || mongoose.model('School', SchoolSchema)
