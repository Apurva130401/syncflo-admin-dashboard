'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'

const activities = [
  {
    user: "John Doe",
    action: "created a new ad creative",
    target: "Nike Summer Campaign",
    time: "2 minutes ago",
    avatar: "/avatars/01.png",
  },
  {
    user: "Jane Smith",
    action: "launched a new voice campaign",
    target: "Black Friday Sale",
    time: "1 hour ago",
    avatar: "/avatars/02.png",
  },
  {
    user: "Peter Jones",
    action: "sent a WhatsApp broadcast",
    target: "New Product Announcement",
    time: "3 hours ago",
    avatar: "/avatars/03.png",
  },
  {
    user: "Mary Johnson",
    action: "updated the branding settings",
    target: "",
    time: "1 day ago",
    avatar: "/avatars/04.png",
  },
];

export function RecentActivity() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center space-x-4"
            >
              <Avatar>
                <AvatarImage src={activity.avatar} />
                <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-slate-900">
                  <span className="font-semibold">{activity.user}</span> {activity.action} {' '}
                  {activity.target && <span className="font-semibold">{activity.target}</span>}
                </p>
                <p className="text-xs text-slate-500">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
