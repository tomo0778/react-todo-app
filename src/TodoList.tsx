import React from "react";
import type { Todo } from "./types";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faClock,
  faFaceGrinWide,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { SUBJECT_COLORS } from "./colors";

type Props = {
  todos: Todo[];
  updateIsDone: (id: string, value: boolean) => void;
  remove: (id: string) => void;
  updateTodo: (updated: Todo) => void;
};

const num2star = (n: number): string => "★".repeat(n);

/*残り時間（🔥期限超過 / ⚠️残り時間 / ⏳残り日数）*/
const renderDeadlineBadge = (deadline: Date | null) => {
  if (!deadline) return null;

  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffHours = diffMs / 1000 / 60 / 60;
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) {
    return (
      <span className="ml-2 px-2 py-0.5 rounded bg-red-600 text-white text-xs">
        🔥 期限超過
      </span>
    );
  }

  if (diffHours < 24) {
    return (
      <span className="ml-2 px-2 py-0.5 rounded bg-orange-500 text-white text-xs">
        ⚠️ 残り {Math.ceil(diffHours)} 時間
      </span>
    );
  }

  return (
    <span className="ml-2 px-2 py-0.5 rounded bg-blue-500 text-white text-xs">
      ⏳ 残り {diffDays} 日
    </span>
  );
};

/* 緊急度カラー */
const getDeadlineColor = (deadline: Date | null): string => {
  if (!deadline) return "";
  const now = dayjs();
  const dl = dayjs(deadline);
  if (dl.isBefore(now)) return "text-red-600 font-bold";
  if (dl.diff(now, "hour") <= 24) return "text-orange-500 font-bold";
  return "text-slate-500";
};

const TodoList = (props: Props) => {
  const todos = props.todos;

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editSubject, setEditSubject] = React.useState("");
  const [editPriority, setEditPriority] = React.useState(3);
  const [editDeadline, setEditDeadline] = React.useState<Date | null>(null);
  const [editMemo, setEditMemo] = React.useState("");

  if (todos.length === 0) {
    return (
      <div className="text-red-500">
        現在、登録されているタスクはありません。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {todos.map((todo) => {
        const deadlineColor = getDeadlineColor(todo.deadline);
        const isEditing = editingId === todo.id;

        return (
          <div
            key={todo.id}
            className={twMerge(
              "rounded-md border bg-white px-3 py-2 drop-shadow-md",
              todo.isDone && "bg-blue-50 opacity-50"
            )}
            style={{
              borderLeft: `8px solid ${
                SUBJECT_COLORS[todo.subject] ?? "#6b7280"
              }`,
            }}
          >
            {/* 完了ラベル */}
            {todo.isDone && (
              <div className="mb-1 rounded bg-blue-400 px-2 py-0.5 text-center text-xs text-white">
                <FontAwesomeIcon icon={faFaceGrinWide} className="mr-1.5" />
                完了済み
                <FontAwesomeIcon icon={faFaceGrinWide} className="ml-1.5" />
              </div>
            )}

            {/* 編集モード */}
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="font-bold">名前：</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="ml-2 rounded-md border p-1"
                  />
                </div>

                <div>
                  <label className="font-bold">科目：</label>
                  <select
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="ml-2 rounded-md border p-1"
                  >
                    {Object.keys(SUBJECT_COLORS).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 優先度（1〜5） */}
                <div>
                  <label className="font-bold mr-2">優先度：</label>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <label key={v} className="mr-2">
                      <input
                        type="radio"
                        value={v}
                        checked={editPriority === v}
                        onChange={(e) => setEditPriority(Number(e.target.value))}
                      />
                      {v}
                    </label>
                  ))}
                </div>

                <div>
                  <label className="font-bold">期限：</label>
                  <input
                    type="datetime-local"
                    value={
                      editDeadline
                        ? dayjs(editDeadline).format("YYYY-MM-DDTHH:mm")
                        : ""
                    }
                    onChange={(e) =>
                      setEditDeadline(
                        e.target.value ? new Date(e.target.value) : null
                      )
                    }
                    className="ml-2 rounded-md border p-1"
                  />
                </div>

                <div>
                  <label className="font-bold">メモ：</label>
                  <textarea
                    value={editMemo}
                    onChange={(e) => setEditMemo(e.target.value)}
                    className="ml-2 w-full rounded-md border p-1"
                    rows={3}
                    placeholder="メモを入力（任意）"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      props.updateTodo({
                        ...todo,
                        name: editName,
                        subject: editSubject,
                        priority: editPriority,
                        deadline: editDeadline,
                        memo: editMemo,
                      });
                      setEditingId(null);
                    }}
                    className="rounded bg-green-500 text-white px-3 py-1"
                  >
                    保存
                  </button>

                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded bg-gray-400 text-white px-3 py-1"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 通常表示モード */}
                <div className="flex flex-row items-baseline text-slate-700">
                  <FontAwesomeIcon
                    icon={faFile}
                    flip="horizontal"
                    className="mr-1"
                  />

                  <input
                    type="checkbox"
                    checked={todo.isDone}
                    onChange={(e) =>
                      props.updateIsDone(todo.id, e.target.checked)
                    }
                    className="mr-1.5 cursor-pointer"
                  />

                  {/* タイトル + 残り時間バッジ */}
                  <div
                    className={twMerge(
                      "text-lg font-bold",
                      todo.isDone && "line-through decoration-2"
                    )}
                  >
                    {todo.name}
                  </div>

                  {renderDeadlineBadge(todo.deadline)}

                  <div className="ml-4 text-sm text-blue-600 font-bold">
                    科目：{todo.subject}
                  </div>

                  <div className="ml-2">優先度</div>
                  <div className="ml-2 text-orange-400">
                    {num2star(todo.priority)}
                  </div>

                  <button
                    onClick={() => {
                      setEditingId(todo.id);
                      setEditName(todo.name);
                      setEditSubject(todo.subject);
                      setEditPriority(todo.priority);
                      setEditDeadline(todo.deadline);
                      setEditMemo(todo.memo ?? "");
                    }}
                    className="ml-auto rounded-md bg-blue-400 px-2 py-1 text-sm text-white hover:bg-blue-500"
                  >
                    編集
                  </button>

                  <button
                    onClick={() => props.remove(todo.id)}
                    className="ml-2 rounded-md bg-red-500 px-2 py-1 text-sm text-white hover:bg-red-600"
                  >
                    削除
                  </button>
                </div>

                {/* 期限表示 */}
                {todo.deadline && (
                  <div className="ml-4 flex items-center text-sm">
                    <FontAwesomeIcon
                      icon={faClock}
                      flip="horizontal"
                      className="mr-1.5"
                    />
                    <div
                      className={twMerge(
                        deadlineColor,
                        todo.isDone && "line-through"
                      )}
                    >
                      期限: {dayjs(todo.deadline).format("YYYY年M月D日 H時m分")}
                    </div>
                  </div>
                )}

                {/* メモ表示 */}
                {todo.memo && (
                  <div className="mt-2">
                    <div className="flex">
                      <div className="font-bold mr-2">メモ：</div>
                      <div className="text-sm text-slate-600 whitespace-pre-line break-word">
                        {todo.memo}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TodoList;
