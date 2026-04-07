import {
  Activity,
  AlertCircle,
  Aperture,
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart2,
  Bell,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  Cloud,
  Cpu,
  Droplet,
  Droplets,
  Eye,
  EyeOff,
  Globe,
  Heart,
  HelpCircle,
  Home,
  ImageIcon,
  Info,
  Layers,
  Lock,
  LogOut,
  Mail,
  Minus,
  Moon,
  RefreshCw,
  Settings,
  Share2,
  Shield,
  Smartphone,
  Star,
  Sun,
  TrendingUp,
  Unlock,
  User,
  Wind,
  X,
  XCircle,
  Zap,
} from "lucide-react-native";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";

const ICON_MAP = {
  activity: Activity,
  "alert-circle": AlertCircle,
  aperture: Aperture,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  award: Award,
  "bar-chart-2": BarChart2,
  bell: Bell,
  calendar: Calendar,
  camera: Camera,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  circle: Circle,
  clock: Clock,
  cloud: Cloud,
  cpu: Cpu,
  droplet: Droplet,
  droplets: Droplets,
  eye: Eye,
  "eye-off": EyeOff,
  globe: Globe,
  heart: Heart,
  "help-circle": HelpCircle,
  home: Home,
  image: ImageIcon,
  info: Info,
  layers: Layers,
  lock: Lock,
  "log-out": LogOut,
  mail: Mail,
  minus: Minus,
  moon: Moon,
  "refresh-cw": RefreshCw,
  settings: Settings,
  "share-2": Share2,
  shield: Shield,
  smartphone: Smartphone,
  star: Star,
  sun: Sun,
  "trending-up": TrendingUp,
  unlock: Unlock,
  user: User,
  wind: Wind,
  x: X,
  "x-circle": XCircle,
  zap: Zap,
} as const;

export type IconName = keyof typeof ICON_MAP;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  strokeWidth?: number;
}

export function Icon({
  name,
  size = 24,
  color = "#000",
  style,
  strokeWidth = 1.8,
}: IconProps) {
  const LucideIcon = ICON_MAP[name];
  if (!LucideIcon) return null;
  return (
    <LucideIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      style={style as any}
    />
  );
}
