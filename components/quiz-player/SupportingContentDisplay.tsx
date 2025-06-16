// File: components/quiz-player/SupportingContentDisplay.tsx
"use client";
import { renderMathContent } from "@/lib/quiz-utils";
import { SupportingContent } from "@/types/quiz";
import { parseGraphData, parseTableData } from "@/lib/quiz-utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const renderError = (error: unknown) => (
  <div className="text-destructive">
    Error rendering content: {String(error)}
  </div>
);

const renderGraph = (content: string) => {
  const graphData = parseGraphData(content);
  if (!graphData || !graphData.datasets.length) return renderError("Invalid graph data");

  const chartConfig = Object.fromEntries(
    graphData.datasets.map((d, i) => [
      d.label,
      { label: d.label, color: COLORS[i % COLORS.length] },
    ])
  );
  const chartData = graphData.labels.map((label, i) => ({
    name: label,
    ...Object.fromEntries(
      graphData.datasets.map((d) => [d.label, d.values[i] || 0])
    ),
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      {graphData.type === 'pie' ? (
        <PieChart>
          <Pie
            data={chartData}
            dataKey={graphData.datasets[0].label}
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
        </PieChart>
      ) : graphData.type === 'line' ? (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          {graphData.datasets.map((d, idx) => (
            <Line
              key={d.label}
              type="monotone"
              dataKey={d.label}
              stroke={COLORS[idx % COLORS.length]}
              activeDot={{ r: 8 }}
            />
          ))}
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
        </LineChart>
      ) : (
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          {graphData.datasets.map((d, idx) => (
            <Bar key={d.label} dataKey={d.label} fill={COLORS[idx % COLORS.length]} />
          ))}
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
        </BarChart>
      )}
    </ChartContainer>
  );
};

const renderTable = (content: string) => {
  const tableData = parseTableData(content);
  if (!tableData) return renderError("Invalid table data format");

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead>
          <tr className="bg-muted/20">
            {tableData.headers.map((header, idx) => (
              <th key={idx} className="px-4 py-2 border-b text-left">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-2 border-b">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const SupportingContentDisplay: React.FC<SupportingContent> = ({
  content,
  type,
  caption,
}) => {
  const normalized =
    typeof content === 'string' ? content : JSON.stringify(content);

  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <img
            src={normalized}
            alt={caption || 'Supporting image'}
            className="max-w-full h-auto rounded-md shadow-md my-4"
          />
        );
      case 'graph':
        return renderGraph(normalized);
      case 'table':
        return renderTable(normalized);
      case 'text':
      default:
        return <div className="text-base">{renderMathContent(normalized)}</div>;
    }
  };

  return (
    <figure className="supporting-content">
      {renderContent()}
      {caption && (
        <figcaption className="text-sm text-muted-foreground mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};