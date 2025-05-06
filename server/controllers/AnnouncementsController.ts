import { Announcement } from '../models/Announcement'

export const AnnouncementsController = {
  async create(data: any) {
    const announcement = new Announcement(data)
    await announcement.save()
    return announcement
  },

  async fetchAll(schoolId:string) {
    return Announcement.find({schoolId}).sort({ pinned: -1, date: -1 })
  }
}
