import React from "react";
import dayjs from "dayjs";
import type { Todo } from "./types";
import { SUBJECT_COLORS } from "./colors";
import { twMerge } from "tailwind-merge";

type Props = {
  todo: Todo;
  onClose: () => void;
  onUpdate: (updated: Todo) => void;
  onRemove: (id: string) => void;
};

const TodoDetailModal: React.FC<Props> = ({
  todo,
  onClose,
  onUpdate,
  onRemove,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);

  // 編集用 state
  const [editName, setEditName] = React.useState(todo.name);
  const [editSubject, setEditSubject] = React.useState(todo.subject);
  const [editPriority, setEditPriority] = React.useState(todo.priority);
  const [editDeadline, setEditDeadline] = React.useState(
    todo.deadline ? dayjs(todo.deadline).format("YYYY-MM-DDTHH:mm") : ""
  );
  const [editMemo, setEditMemo] = React.useState(todo.memo ?? "");

  const saveChanges = () => {
    onUpdate({
      ...todo,
      name: editName,
      subject: editSubject,
      priority: editPriority,
      deadline: editDeadline ? new Date(editDeadline) : null,
      memo: editMemo,
    });
    setIsEditing(false);
  };

  // 科目カラー（左線色）
  const borderColor =
    SUBJECT_COLORS[todo.subject] ?? "#3b82f6"; // fallback 青

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div
        className={twMerge(
          "bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-xl border-l-8",
        )}
        style={{ borderLeftColor: borderColor }}
      >
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? "タスクを編集" : "タスクの詳細"}
        </h2>

        {/*閲覧モード*/}
        {!isEditing && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold">{todo.name}</div>

              {/* 科目タグ（カラー復活） */}
              <span
                className="px-2 py-0.5 rounded text-white text-sm"
                style={{ backgroundColor: borderColor }}
              >
                {todo.subject}
              </span>
            </div>

            {/* 優先度 */}
            <div>
              <div className="text-sm text-slate-500">優先度：</div>
              <div className="text-orange-500 text-xl">
                {"★".repeat(todo.priority)}
              </div>
            </div>

            {/* 期限 */}
            {todo.deadline && (
              <div>
                <div className="text-sm text-slate-500">期限：</div>
                <div>
                  {dayjs(todo.deadline).format("YYYY年MM月DD日 HH:mm")}
                </div>
              </div>
            )}

            {/* 状態 */}
            <div>
              <div className="text-sm text-slate-500">状態：</div>
              <div>{todo.isDone ? "完了済み" : "進行中"}</div>
            </div>

            {/* メモ */}
            {todo.memo && (
              <div>
                <div className="text-sm text-slate-500">メモ：</div>
                <div className="whitespace-pre-wrap p-2 border rounded bg-slate-50">
                  {todo.memo}
                </div>
              </div>
            )}

            {/* ボタン類 */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded bg-blue-500 text-white"
              >
                編集
              </button>

              {/* ★ 完了ボタン 復活 */}
              {!todo.isDone && (
                <button
                  onClick={() => {
                    onUpdate({ ...todo, isDone: true });
                    onClose();
                  }}
                  className="px-4 py-2 rounded bg-green-600 text-white"
                >
                  完了にする
                </button>
              )}

              {/* 削除 */}
              <button
                onClick={() => {
                  if (window.confirm("本当に削除しますか？")) {
                    onRemove(todo.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 rounded bg-red-500 text-white"
              >
                削除
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-500 text-white"
              >
                閉じる
              </button>
            </div>
          </div>
        )}

        {/* 編集モード */}
        {isEditing && (
          <div className="space-y-4">
            {/* 名前 */}
            <div>
              <label className="font-bold">名前</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border rounded w-full p-2 mt-1"
              />
            </div>

            {/* 科目 */}
            <div>
              <label className="font-bold">科目</label>
              <select
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="border rounded w-full p-2 mt-1"
              >
                {Object.keys(SUBJECT_COLORS).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* 優先度 */}
            <div>
              <label className="font-bold">優先度</label>
              <div className="flex gap-4 mt-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <label key={v} className="flex items-center gap-1">
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
            </div>

            {/* 期限 */}
            <div>
              <label className="font-bold">期限</label>
              <input
                type="datetime-local"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                className="border rounded w-full p-2 mt-1"
              />
            </div>

            {/* メモ */}
            <div>
              <label className="font-bold">メモ</label>
              <textarea
                value={editMemo}
                onChange={(e) => setEditMemo(e.target.value)}
                rows={4}
                className="border rounded w-full p-2 mt-1"
              />
            </div>

            {/* 編集ボタン */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={saveChanges}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                保存
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded bg-gray-500 text-white"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoDetailModal;
