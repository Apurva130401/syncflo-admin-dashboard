'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'

const teamMembers = [
  {
    name: "John Doe",
    role: "Administrator",
    avatar: "/avatars/01.png",
  },
  {
    name: "Jane Smith",
    role: "Marketing Manager",
    avatar: "/avatars/02.png",
  },
  {
    name: "Peter Jones",
    role: "Sales Representative",
    avatar: "/avatars/03.png",
  },
  {
    name: "Mary Johnson",
    role: "Support Agent",
    avatar: "/avatars/04.png",
  },
  {
    name: "David Williams",
    role: "Developer",
    avatar: "/avatars/05.png",
  },
];

export function TeamMembers() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center space-x-4"
            >
              <Avatar>
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
