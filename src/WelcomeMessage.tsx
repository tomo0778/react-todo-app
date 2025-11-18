import React from "react";

type Props = {
  name: string;
  uncompletedCount: number;
  totalCount: number;
  todayCount: number;
  next7daysCount: number;
};

const WelcomeMessage = ({
  uncompletedCount,
  totalCount,
  todayCount,
  next7daysCount,
}: Props) => {
  return (
    <div className="rounded-md border border-slate-300 bg-white p-3 shadow-sm">
      <div className="text-xl font-bold mb-1">
        こんにちは！
      </div>

      <div className="text-slate-700 space-y-1">
        <div>未完了タスク数: <span className="font-bold">{uncompletedCount}</span></div>
        <div>全タスク数: <span className="font-bold">{totalCount}</span></div>
        <div>今日締め切りのタスク数: <span className="font-bold text-red-500">{todayCount}</span></div>
        <div>今後7日間のタスク数: <span className="font-bold text-orange-500">{next7daysCount}</span></div>
      </div>
    </div>
  );
};

export default WelcomeMessage;