import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const AnalyticsCard = ({
  title,
  value,
  icon,
  description,
  trend,
  className
}: AnalyticsCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-neutral-500">{title}</CardTitle>
        <div className="w-8 h-8 bg-neutral-100 rounded-md flex items-center justify-center text-primary-600">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {trend && (
          <p className="text-xs flex items-center">
            <span
              className={cn(
                "inline-block mr-1",
                trend.isPositive ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            {description && <span className="text-neutral-500">{description}</span>}
          </p>
        )}
        {!trend && description && <p className="text-xs text-neutral-500">{description}</p>}
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
