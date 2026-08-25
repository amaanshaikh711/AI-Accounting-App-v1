import React from 'react';
import { X, CheckCheck, AlertCircle, Sparkles, Receipt, ArrowRight, Bell } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (route: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  navigate,
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAccounting();

  if (!isOpen) return null;

  const handleAction = (notif: (typeof notifications)[0]) => {
    markNotificationRead(notif.id);
    if (notif.linkRoute) {
      navigate(notif.linkRoute);
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle size={15} className="text-red-500 shrink-0" />;
      case 'review':
        return <Sparkles size={15} className="text-amber-500 shrink-0" />;
      case 'success':
        return <Receipt size={15} className="text-emerald-500 shrink-0" />;
      default:
        return <Bell size={15} className="text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                System Notifications
              </h2>
              <p className="text-[11px] text-slate-500">
                Accounting alerts, anomalies, and statutory updates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 p-1"
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                <span>Mark All Read</span>
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-xs text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No active notifications.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleAction(notif)}
                  className={`p-3 rounded-xs cursor-pointer transition-colors ${
                    !notif.read
                      ? 'bg-slate-50 hover:bg-slate-100/80 border-l-2 border-slate-900'
                      : 'hover:bg-slate-50/60 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {notif.title}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {notif.description}
                      </p>
                      {notif.linkRoute && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-900 font-semibold">
                          <span>Take Action</span>
                          <ArrowRight size={12} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 font-mono">
            AI Accounting Anomaly Detection Active
          </div>
        </div>
      </div>
    </div>
  );
};
