import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/lib/types";

type OrderStatusBadgeProps = {
  status: Order['status'];
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const variant = {
    Pending: "secondary",
    Completed: "default",
    Failed: "destructive",
  }[status] as "secondary" | "default" | "destructive";

  const className = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
    Completed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
    Failed: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
  }[status];

  return <Badge variant={variant} className={cn('font-semibold', className)}>{status}</Badge>;
}
