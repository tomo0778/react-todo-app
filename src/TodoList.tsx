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

type Props = {
  todos: Todo[];
  updateIsDone: (id: string, value: boolean) => void;
  remove: (id: string) => void;
  updateTodo: (updated: Todo) => void; // ← ★追加
};

const num2star = (n: number): string => "★".repeat(4 - n);

// -------------------------------
// 期限に応じた緊急度カラー
// -------------------------------
const getDeadlineColor = (deadline: Date | null): string => {
  if (!deadline) return "";

  const now = dayjs();
  const dl = dayjs(deadline);

  if (dl.isBefore(now)) {
    return "text-red-600 font-bold"; // 期限切れ
  }
  if (dl.diff(now, "hour") <= 24) {
    return "text-orange-500 font-bold"; // 24時間以内
  }
  return "text-slate-500"; // 余裕あり
};

const subjectColorMap: Record<string, string> = {
  "国語3": "border-blue-600",
  "社会3": "border-amber-600",
  "解析1": "border-emerald-600",
  "解析2": "border-lime-600",
  "線形代数・微分方程式": "border-indigo-600",
  "基礎物理3": "border-purple-600",
  "保健・体育3": "border-yellow-500",
  "英語5": "border-sky-600",
  "英語表現3": "border-orange-500",
  "情報3": "border-violet-600",
  "プログラミング2": "border-green-600",
  "プログラミング3": "border-teal-600",
  "アルゴリズムとデータ構造1": "border-cyan-600",
  "論理回路2": "border-red-600",
  "電気電子回路1": "border-orange-700",
  "知識科学概論": "border-fuchsia-600",
  "知能情報実験実習1": "border-stone-500",
  "応用専門概論": "border-slate-600",
  "応用専門PBL1": "border-emerald-700",
  "その他": "border-gray-500",
};

const TodoList = (props: Props) => {
  const todos = props.todos;

  // -------------------------
  // 編集用の state（STEP2）
  // -------------------------
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editSubject, setEditSubject] = React.useState("");
  const [editPriority, setEditPriority] = React.useState(3);
  const [editDeadline, setEditDeadline] = React.useState<Date | null>(null);

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
              "rounded-md border border-slate-500 bg-white px-3 py-2 drop-shadow-md",
              "border-l-8",                                // ← 左ボーダー太く
              subjectColorMap[todo.subject] || "border-gray-400",
              todo.isDone && "bg-blue-50 opacity-50"
            )}
          >
            {/* 完了ラベル */}
            {todo.isDone && (
              <div className="mb-1 rounded bg-blue-400 px-2 py-0.5 text-center text-xs text-white">
                <FontAwesomeIcon icon={faFaceGrinWide} className="mr-1.5" />
                完了済み
                <FontAwesomeIcon icon={faFaceGrinWide} className="ml-1.5" />
              </div>
            )}

            {/* ----------------------------------------------------
                編集モード表示 (STEP3)
            ----------------------------------------------------- */}
            {isEditing ? (
              <div className="space-y-3">

                {/* 名前 */}
                <div>
                  <label className="font-bold">名前：</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="ml-2 rounded-md border p-1"
                  />
                </div>

                {/* 科目 */}
                <div>
                  <label className="font-bold">科目：</label>
                  <select
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="ml-2 rounded-md border p-1"
                  >
                    <option value="国語3">国語3</option>
                    <option value="社会3">社会3</option>
                    <option value="解析1">解析1</option>
                    <option value="解析2">解析2</option>
                    <option value="線形代数・微分方程式">線形代数・微分方程式</option>
                    <option value="基礎物理3">基礎物理3</option>
                    <option value="保健・体育3">保健・体育3</option>
                    <option value="英語5">英語5</option>
                    <option value="英語表現3">英語表現3</option>
                    <option value="情報3">情報3</option>
                    <option value="プログラミング2">プログラミング2</option>
                    <option value="プログラミング3">プログラミング3</option>
                    <option value="アルゴリズムとデータ構造1">アルゴリズムとデータ構造1</option>
                    <option value="論理回路2">論理回路2</option>
                    <option value="電気電子回路1">電気電子回路1</option>
                    <option value="知識科学概論">知識科学概論</option>
                    <option value="知能情報実験実習1">知能情報実験実習1</option>
                    <option value="応用専門概論">応用専門概論</option>
                    <option value="応用専門PBL1">応用専門PBL1</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                {/* 優先度 */}
                <div>
                  <label className="font-bold mr-2">優先度：</label>
                  {[1, 2, 3].map((v) => (
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

                {/* 期限 */}
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

                {/* 保存 / キャンセル */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      props.updateTodo({
                        ...todo,
                        name: editName,
                        subject: editSubject,
                        priority: editPriority,
                        deadline: editDeadline,
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
              /* ----------------------------------------------------
                 通常表示モード
              ---------------------------------------------------- */
              <>
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

                  <div
                    className={twMerge(
                      "text-lg font-bold",
                      todo.isDone && "line-through decoration-2"
                    )}
                  >
                    {todo.name}
                  </div>

                  <div className="ml-4 text-sm text-blue-600 font-bold">
                    科目：{todo.subject}
                  </div>

                  <div className="ml-2">優先度</div>
                  <div className="ml-2 text-orange-400">
                    {num2star(todo.priority)}
                  </div>

                  {/* 編集ボタン */}
                  <button
                    onClick={() => {
                      setEditingId(todo.id);
                      setEditName(todo.name);
                      setEditSubject(todo.subject);
                      setEditPriority(todo.priority);
                      setEditDeadline(todo.deadline);
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
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TodoList;