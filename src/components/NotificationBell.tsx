import React, { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
}

interface NotificationBellProps {
  recipientType: 'contractor' | 'admin';
  recipientId: string;
  /** For admin command center styling */
  variant?: 'admin' | 'default';
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  recipientType,
  recipientId,
  variant = 'default',
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_type', recipientType)
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false })
      .limit(20) as any;
    setNotifications(data || []);
  }, [recipientType, recipientId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase
      .from('notifications')
      .update({ is_read: true } as any)
      .in('id', unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true } as any)
      .eq('id', id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const isAdmin = variant === 'admin';

  const typeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`relative p-2 rounded transition-all duration-300 hover:scale-105 ${
            isAdmin
              ? 'holographic-panel hover:bg-cyan-500/10'
              : 'hover:bg-muted'
          }`}
        >
          <Bell
            className={`h-4 w-4 ${
              isAdmin ? 'text-cyan-400' : 'text-foreground'
            }`}
          />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className={`w-80 p-0 ${
          isAdmin
            ? 'bg-[#0d0d15] border-cyan-500/30'
            : 'bg-popover border-border'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b ${
            isAdmin ? 'border-cyan-500/20' : 'border-border'
          }`}
        >
          <h4
            className={`text-sm font-semibold ${
              isAdmin ? 'text-cyan-300 font-mono' : 'text-foreground'
            }`}
          >
            Notifications
          </h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className={`text-[10px] h-6 ${
                isAdmin ? 'text-cyan-400 hover:text-cyan-300' : ''
              }`}
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications list */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell
                className={`h-8 w-8 mx-auto mb-2 ${
                  isAdmin ? 'text-cyan-400/20' : 'text-muted-foreground/30'
                }`}
              />
              <p
                className={`text-xs ${
                  isAdmin
                    ? 'text-cyan-400/40 font-mono'
                    : 'text-muted-foreground'
                }`}
              >
                No notifications yet
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`px-4 py-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                  isAdmin
                    ? `border-cyan-500/10 ${
                        n.is_read
                          ? 'opacity-50'
                          : 'bg-cyan-500/5 hover:bg-cyan-500/10'
                      }`
                    : `border-border ${
                        n.is_read
                          ? 'opacity-50'
                          : 'bg-primary/5 hover:bg-primary/10'
                      }`
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">{typeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium ${
                        isAdmin ? 'text-cyan-300 font-mono' : 'text-foreground'
                      }`}
                    >
                      {n.title}
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        isAdmin
                          ? 'text-cyan-400/60 font-mono'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {n.message}
                    </p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isAdmin
                          ? 'text-cyan-400/30 font-mono'
                          : 'text-muted-foreground/50'
                      }`}
                    >
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
