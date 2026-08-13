import webpush from 'web-push'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type DigestMessage = { title: string; body: string }

export async function sendDigest(
  userId: string,
  message: DigestMessage
): Promise<{ pushSuccess: boolean; emailSuccess: boolean }> {
  const [pushSuccess, emailSuccess] = await Promise.all([
    sendPush(userId, message),
    sendEmail(userId, message),
  ])
  return { pushSuccess, emailSuccess }
}

async function sendPush(userId: string, message: DigestMessage): Promise<boolean> {
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return false

  const payload = JSON.stringify({ title: message.title, body: message.body })

  const results = await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
        return true
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number }).statusCode
        console.error('Push send error:', statusCode, err)
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        }
        return false
      }
    })
  )

  return results.some((r) => r === true) // succeeded if at least one device got it
}

async function sendEmail(userId: string, message: DigestMessage): Promise<boolean> {
  const { data: userData } = await supabase.auth.admin.getUserById(userId)
  const email = userData?.user?.email
  if (!email) return false

  const { error } = await resend.emails.send({
    from: 'Renewal Reminder <onboarding@resend.dev>',
    to: email,
    subject: message.title,
    html: `<p>${message.body}</p><p><a href="https://reminder2-nu.vercel.app">Open Renewal Reminder</a> to see details.</p>`,
  })

  if (error) {
    console.error('Resend error:', error)
    return false
  }
  return true
}