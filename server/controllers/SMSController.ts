import qs from 'qs'
import xmlToJson from 'xml-js'

let selected: string[] = []

const BASE_URL = 'https://www.budgetmessaging.com'

function avoidRateLimit(delay = 500) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

async function credits(details: { user: string; emis: string }) {
  const url = `${BASE_URL}/credits.ashx?user=${details.user}&password=${details.emis}`
  return await $fetch<string>(url)
}

async function send(sms: {
  user: string
  password: string
  cell: string
  msg: string
}) {
  return await $fetch<string>(`${BASE_URL}/sendsms.ashx`, {
    method: 'POST',
    body: qs.stringify(sms),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

function sendRequest(sms: {
  user: string
  password: string
  cell: string
  msg: string
}) {
  return $fetch<string>(`${BASE_URL}/sendsms.ashx`, {
    method: 'POST',
    body: qs.stringify(sms),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

async function sendByBatch(
  recipients: string[],
  message: string,
  credentials: { user: string; emis: string }
) {
  try {
    const batchSize = parseInt(process.env.SMS_BATCH || '20', 10)
    const totalBatches = Math.ceil(recipients.length / batchSize)

    for (let i = 0; i < totalBatches; i++) {
      const batch = recipients.slice(i * batchSize, (i + 1) * batchSize)

      const smsPromises = batch.map(cell => {
        const params = {
          user: credentials.user,
          password: credentials.emis,
          cell,
          msg: message,
        }
        return sendRequest(params)
      })

      const result = await Promise.all(smsPromises)
      console.log(`📨 Batch ${i + 1}/${totalBatches} sent`, result)

      if (i < totalBatches - 1) {
        await avoidRateLimit()
      }
    }
  } catch (err) {
    console.error('❌ SMS sending failed:', err)
  }
}

async function sent(details: {
  user: string
  emis: string
  start: string
  end: string
}) {
  const url = `${BASE_URL}/smsstatus.ashx?user=${details.user}&password=${details.emis}&startdate=${details.start}&enddate=${details.end}`
  const response = await $fetch<string>(url)

  const json = xmlToJson.xml2json(response, {
    compact: true,
    spaces: 2,
  })

  const parsed = JSON.parse(json)
  return parsed.NewDataSet?.Table || []
}

async function replies(details: {
  user: string
  emis: string
  start: string
  end: string
}) {
  const url = `${BASE_URL}/smsreply.ashx?user=${details.user}&password=${details.emis}&startdate=${details.start}&enddate=${details.end}`
  const response = await $fetch<string>(url)

  const json = xmlToJson.xml2json(response, {
    compact: true,
    spaces: 2,
  })

  const parsed = JSON.parse(json)
  return parsed.NewDataSet?.Table || []
}

export default {
  send,
  sendRequest,
  sendByBatch,
  sent,
  replies,
  credits,
  selected,
}
