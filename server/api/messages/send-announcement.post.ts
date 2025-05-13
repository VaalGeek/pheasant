// server/api/messages/send.post.ts
import { sendPushNotification } from '~/utils/notifications'
import { Stakeholder } from '~/server/models/Stakeholder'
import SMSController from '~/server/controllers/SMSController'
import { defineEventHandler, readBody, createError } from 'h3'

import { Announcement } from '~/server/models/Announcement'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)

        if (!body.message || !body.groups?.length || !body.sendType) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid payload',
                data: {
                    requirements: {
                        message: 'required',
                        groups: 'required (non-empty array)',
                        sendType: 'required (notifications|sms|both)',
                    },
                },
            })
        }

        const {
            schoolId,
            title = 'Message',
            message,
            groups,
            sendType,
            grades = [],
            classes = [],
            staffGroups = [],
        } = body

        if (!['notifications', 'sms', 'both'].includes(sendType)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid sendType. Must be one of: notifications, sms, both',
            })
        }

        const queryConditions: Record<string, any>[] = [{schoolId, groups: { $in: groups } }]
        
        if (grades.length && !grades.includes('All')) {
            queryConditions.push({ grade: { $in: grades } })
        }
        if (classes.length && !classes.includes('All')) {
            queryConditions.push({ class: { $in: classes } })
        }
        if (staffGroups.length && !staffGroups.includes('All')) {
            queryConditions.push({ staffGroups: { $in: staffGroups } })
        }
        

        const stakeholders = await Stakeholder.find(
            { $or: queryConditions },
            { fcmToken: 1, cell: 1, _id: 0 }
        ).lean()

        const fcmTokens = stakeholders
            .map((s) => s.fcmToken?.trim())
            .filter(Boolean)
        const cellNumbers = stakeholders
            .flatMap((s) => (Array.isArray(s.cell) ? s.cell : []))
            .map((c) => c?.trim())
            .filter(Boolean)

            const savedAnnouncement = await Announcement.create({
                schoolId: body.schoolId,
                title: title.trim(),
                content: message.trim(),
                category: 'Announcement',
                pinned: false,
              })
              


              const notificationPayload = {
                notification: {
                  title: title.trim(),
                  body: message.trim(),
                },
                data: {
                  title: title.trim(),
                  body: message.trim(),
                  icon: "/icon.png",
                  badge: "/icon.png",
                  click_action: `${process.env.BASE_URL}/announcements?msgId=${savedAnnouncement._id.toString()}`,
                }
              }
              


        const results = {
            fcm: 0,
            sms: 0,
        }

        // Send push notifications
        if (sendType !== 'sms' && fcmTokens.length > 0) {
            await sendPushNotification(fcmTokens, notificationPayload)
            results.fcm = fcmTokens.length
        }

        // Send SMS using SMSController
        if (sendType !== 'notifications' && cellNumbers.length > 0) {
            const smsText = `${title}: ${message}`.slice(0, 160)
            const smsPayloads = cellNumbers.map((cell) => ({
                user: process.env.SMS_USER!,
                password: process.env.SMS_PASSWORD!,
                cell,
                msg: smsText,
            }))

            const batchSize = 10
            for (let i = 0; i < smsPayloads.length; i += batchSize) {
                const batch = smsPayloads.slice(i, i + batchSize)
                await Promise.all(batch.map(SMSController.send))
                results.sms += batch.length
            }
        }

        return {
            success: true,
            message: `Messages sent successfully via ${sendType}`,
            results,
        }
    } catch (error: any) {
        console.error('Message sending error:', error)

        if (error?.name === 'MongoError') {
            throw createError({
                statusCode: 500,
                statusMessage: 'Database error',
                data: {
                    code: error.code,
                    message: error.message,
                },
            })
        }

        if (error?.statusCode) throw error

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error',
            data: {
                originalError: error.message,
            },
        })
    }
})
