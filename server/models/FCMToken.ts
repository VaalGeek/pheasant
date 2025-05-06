// models/FCMToken.model.ts
import { Schema, model, Document } from 'mongoose';

interface Fingerprint {
  userAgent: string;
  screen: {
    width: number;
    height: number;
  };
  timezone: string;
}

interface NotificationPreferences {
  schoolAlerts: boolean;
  eventReminders: boolean;
  emergencyNotifications: boolean;
}

interface FCMTokenDocument extends Document {
  browserId: string;
  token: string;
  fingerprint: Fingerprint;
  notificationPreferences: NotificationPreferences;
  created: Date;
  lastUpdated: Date;
}

const FingerprintSchema = new Schema<Fingerprint>({
  userAgent: { type: String, required: true },
  screen: {
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  timezone: { type: String, required: true }
});

const FCMTokenSchema = new Schema<FCMTokenDocument>({
  browserId: { 
    type: String, 
    required: true,
    index: true,
    unique: true
  },
  token: { 
    type: String, 
    required: true,
    minlength: 100,
    maxlength: 500,
    index: true
  },
  fingerprint: { 
    type: FingerprintSchema,
    required: true 
  },
  notificationPreferences: {
    schoolAlerts: { type: Boolean, default: true },
    eventReminders: { type: Boolean, default: true },
    emergencyNotifications: { type: Boolean, default: true }
  },
  created: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

// Auto-update lastUpdated timestamp
FCMTokenSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// TTL index for automatic cleanup (60 days)
FCMTokenSchema.index(
  { lastUpdated: 1 },
  { expireAfterSeconds: 60 * 24 * 60 * 60 } // 60 days in seconds
);

export const FCMToken = model<FCMTokenDocument>('FCMToken', FCMTokenSchema);