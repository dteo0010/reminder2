import Image from "next/image";
import { EnableNotifications } from '@/components/EnableNotifications'

export default function Home() {
    return (
    <div>
      <h1>Renewal Reminder</h1>
      <EnableNotifications />
    </div>
  )
}
