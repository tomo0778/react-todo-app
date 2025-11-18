import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { Todo } from "./types";
import { SUBJECT_COLORS } from "./colors";
import dayjs from "dayjs";

type Props = {
  todos: Todo[];
  onEventClick: (todo: Todo) => void;
  onDateClick: (date: Date) => void;
};

// 優先度の星
const num2star = (n: number) => "★".repeat(n);

// 残り時間バッジ（TodoList と共通）
const renderDeadlineBadge = (deadline: Date | null) => {
  if (!deadline) return null;

  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffHours = diffMs / 1000 / 60 / 60;
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) {
    return (
      <span className="ml-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px]">
        🔥期限超過
      </span>
    );
  }

  if (diffHours < 24) {
    return (
      <span className="ml-1 px-1.5 py-0.5 rounded bg-orange-500 text-white text-[10px]">
        ⚠️残り{Math.ceil(diffHours)}時間
      </span>
    );
  }

  return (
    <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-500 text-white text-[10px]">
      ⏳残り{diffDays}日
    </span>
  );
};

const CalendarView: React.FC<Props> = ({ todos, onEventClick, onDateClick }) => {
  const events = todos
    .filter((t) => t.deadline)
    .map((t) => ({
      id: t.id,
      title: t.name,
      date: t.deadline!.toISOString(),
      todo: t, // ← extendedProps で丸ごと渡す
      backgroundColor: SUBJECT_COLORS[t.subject] ?? "#3b82f6",
      borderColor: SUBJECT_COLORS[t.subject] ?? "#3b82f6",
      textColor: "white",
    }));

  return (
    <div className="w-full bg-white rounded-md p-2 shadow">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={events}
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "",
        }}
        
        eventClick={(info) => {
          const todo = info.event.extendedProps.todo as Todo;
          onEventClick(todo);
        }}

        dateClick={(info) => {
          onDateClick(info.date);
        }}

        /* カスタムイベント表示*/
        eventContent={(arg) => {
          const todo = arg.event.extendedProps.todo as Todo;
          const bg = arg.backgroundColor ?? "#3b82f6";

          return (
            <div
              className="rounded p-1 text-[10px] flex flex-col"
              style={{ backgroundColor: bg, color: "white" ,overflow: "hidden",lineHeight: "1.1",}}
            >
              {/* 上段：タイトル + 残り時間 */}
              <div className="flex items-center font-bold text-xs leading-none">
                <span>{todo.name}</span>
                {renderDeadlineBadge(todo.deadline)}
              </div>

              {/* 優先度（★） */}
              <div className="text-orange-300">
                {num2star(todo.priority)}
              </div>

              {/* 時刻 */}
              {todo.deadline && (
                <div className="opacity-90 leading-none">
                  {dayjs(todo.deadline).format("HH:mm")}
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default CalendarView;
