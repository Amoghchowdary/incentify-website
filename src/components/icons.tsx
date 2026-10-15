import {
  Building2,
  Briefcase,
  ReceiptText,
  FileText,
  ShieldCheck,
  Calculator,
  Coins,
  Landmark,
  LineChart,
  Users,
  Scale,
  ClipboardList,
  Globe2,
  KeyRound,
  Wallet,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/data/services";

const map: Record<IconName, LucideIcon> = {
  building: Building2,
  briefcase: Briefcase,
  receipt: ReceiptText,
  file: FileText,
  shield: ShieldCheck,
  calculator: Calculator,
  coins: Coins,
  bank: Landmark,
  chart: LineChart,
  users: Users,
  scale: Scale,
  clipboard: ClipboardList,
  globe: Globe2,
  key: KeyRound,
  wallet: Wallet,
  heart: HeartHandshake,
};

export function ServiceIcon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const Icon = map[name] ?? FileText;
  return <Icon className={className} aria-hidden="true" />;
}
