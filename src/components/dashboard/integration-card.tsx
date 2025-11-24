import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface IntegrationCardProps {
  name: string
  description: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: string
  onConnect?: () => void
  onDisconnect?: () => void
  onConfigure?: () => void
}

export function IntegrationCard({
  name,
  description,
  status,
  lastSync,
  onConnect,
  onDisconnect,
  onConfigure
}: IntegrationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'disconnected': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {lastSync && (
          <div className="text-sm text-gray-500 mb-4">
            Last synced: {lastSync}
          </div>
        )}
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={onConfigure}>
            Configure
          </Button>
          {status === 'connected' ? (
            <Button variant="outline" size="sm" onClick={onDisconnect}>
              Disconnect
            </Button>
          ) : (
            <Button size="sm" onClick={onConnect}>
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
