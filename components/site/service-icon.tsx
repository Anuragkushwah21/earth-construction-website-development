import {
  Building2,
  ClipboardList,
  Droplets,
  HardHat,
  Layers,
  Ruler,
  Route,
  Scissors,
  Truck,
  Users,
  Waves,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/**
 * Only these icons can be selected in the admin, so a stored icon name can
 * never resolve to arbitrary code.
 */
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  Route,
  Building2,
  Droplets,
  Waves,
  Scissors,
  Layers,
  Users,
  ClipboardList,
  Ruler,
  Truck,
  HardHat,
  Wrench,
}

export const SERVICE_ICON_NAMES = Object.keys(SERVICE_ICONS)

export function ServiceIcon({ name, size = 22 }: { name: string; size?: number }) {
  const Icon = SERVICE_ICONS[name] ?? Ruler
  return <Icon size={size} aria-hidden />
}
