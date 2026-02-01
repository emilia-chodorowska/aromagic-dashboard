import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  DollarSign,
  Calculator,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Pulpit', icon: LayoutDashboard },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'calculator', label: 'Kalkulacje', icon: Calculator },
  { id: 'settings', label: 'Ustawienia', icon: Settings },
]

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="px-4 py-7 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => onViewChange('dashboard')}
          className="text-gray-800 flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <Shield className="h-8 w-8 text-purple-600" />
          {!collapsed && (
            <span className="text-2xl font-bold">AromaStats</span>
          )}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:block p-1 rounded-full hover:bg-gray-100"
        >
          {collapsed ? (
            <ChevronRight className="w-6 h-6" />
          ) : (
            <ChevronLeft className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full flex items-center space-x-4 py-2.5 px-4 rounded-lg transition duration-200',
                isActive
                  ? 'bg-purple-50 text-purple-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="w-6 h-6 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 mt-auto border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-purple-600 text-white font-semibold">
              CE
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">
                Chodorowska Emilia
              </p>
              <button className="text-xs text-gray-500 hover:underline flex items-center gap-1">
                <LogOut className="h-3 w-3" />
                Wyloguj
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
