// server/models/Stakeholder.ts

import mongoose, { Schema } from 'mongoose';

const StakeholderSchema = new mongoose.Schema({
  schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  role: {
    type: String,
    enum: ['Learner', 'Parent', 'Staff'],
    required: true,
  },
  groups: {
    type: [String], // e.g., ['SGB', 'RCL', 'Educator']
    default: [],
  },
  fcmToken: {
    type: String, 
    default: '',
  },

  pushSubscription: {
    type: Object,
    default: null,
  },
  
  verified: {
    type: Boolean, 
    default: false,
  },
  email: {
    type: String, 
    default: '',
  },
  otp: {
    value: { type: String, default: '' },
    expiresAt: { type: Date,default:null }
  },
  name: String,
  surname: String,
  gender: String,
  grade: String,        // Only for learners
  class: String,        // Only for learners
  language: String,
  cell: Array,

  // Relations
  learnerRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stakeholder' }], // For parents
  parentRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stakeholder' }],  // For learners
}, { timestamps: true })

export const Stakeholder = mongoose.models.Stakeholder || mongoose.model('Stakeholder', StakeholderSchema)
