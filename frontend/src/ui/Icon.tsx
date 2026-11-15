import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Earth,
  Ellipsis,
  Heart,
  LayoutDashboard,
  LoaderCircle,
  Orbit,
  Radio,
  RefreshCw,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Thermometer,
  Users,
  Waves,
  Wind,
  X,
} from 'lucide-react';
const icons = {
  activity: Activity,
  arrow: ArrowRight,
  bell: Bell,
  book: BookOpen,
  check: Check,
  checked: CheckCircle2,
  chevron: ChevronRight,
  alert: CircleAlert,
  clipboard: ClipboardCheck,
  clock: Clock3,
  download: ArrowDownToLine,
  earth: Earth,
  more: Ellipsis,
  heart: Heart,
  dashboard: LayoutDashboard,
  loader: LoaderCircle,
  orbit: Orbit,
  radio: Radio,
  refresh: RefreshCw,
  rocket: Rocket,
  shield: ShieldCheck,
  sliders: SlidersHorizontal,
  sparkles: Sparkles,
  thermometer: Thermometer,
  users: Users,
  chart: Waves,
  wind: Wind,
  close: X,
};
export type IconName = keyof typeof icons;
export function Icon({
  name,
  size = 18,
  className = '',
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const Component = icons[name];
  return <Component aria-hidden="true" size={size} strokeWidth={1.6} className={className} />;
}
