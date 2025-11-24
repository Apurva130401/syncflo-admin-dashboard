import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bot, Edit, Trash2, Play, Pause } from 'lucide-react'

interface Agent {
  id: string
  name: string
  type: 'whatsapp' | 'voice'
  description: string
  status: 'active' | 'inactive' | 'training'
  createdAt: string
  lastActive?: string
}

interface AgentCardProps {
  agent: Agent
  getStatusColor: (status: string) => string
  getTypeColor: (type: string) => string
}

export function AgentCard({ agent, getStatusColor, getTypeColor }: AgentCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-5 w-5" />
            {agent.name}
          </CardTitle>
          <Badge className={getStatusColor(agent.status)}>
            {agent.status}
          </Badge>
        </div>
        <CardDescription>{agent.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span>Type</span>
            <Badge className={getTypeColor(agent.type)}>
              {agent.type}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Created</span>
            <span>{agent.createdAt}</span>
          </div>
          {agent.lastActive && (
            <div className="flex justify-between text-sm">
              <span>Last Active</span>
              <span>{agent.lastActive}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <div className="flex space-x-2">
            {agent.status === 'active' ? (
              <Button variant="outline" size="sm">
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                <Play className="mr-2 h-4 w-4" />
                {agent.status === 'training' ? 'Training...' : 'Activate'}
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
