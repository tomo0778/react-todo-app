import React from "react";
import type { Todo } from "./types";
import TodoList from "./TodoList";
import WelcomeMessage from "./WelcomeMessage";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import TodoDetailModal from "./TodoDetailModal";
import NewTaskModal from "./NewTaskModal";
import CalendarView from "./CalendarView"; 

const SUBJECTS = [
  "国語3", "社会3", "解析1", "解析2", "線形代数・微分方程式",
  "基礎物理3", "保健・体育3", "英語5", "英語表現3", "情報3",
  "プログラミング2", "プログラミング3", "アルゴリズムとデータ構造1",
  "論理回路2", "電気電子回路1", "知識科学概論", "知能情報実験実習1",
  "応用専門概論", "応用専門PBL1", "その他",
] as const;

/** フィルター用 */
type FilterStatus = "all" | "todo" | "done" | "overdue";
type SortOption = "deadlineAsc" | "deadlineDesc" | "priorityHigh" | "priorityLow";

const FILTERS: FilterStatus[] = ["all", "todo", "done", "overdue"];

const App: React.FC = () => {
  const [todos, setTodos] = React.useState<Todo[]>([]);
  const [newMemo, setNewMemo] = React.useState<string>("");
  const [selectedTodo, setSelectedTodo] = React.useState<Todo | null>(null);
  const [newTaskDate, setNewTaskDate] = React.useState<Date | null>(null);

  /**StrictMode 用初回ガード */
  const didInit = React.useRef(false);

  React.useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const saved = localStorage.getItem("todos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Todo[];
        const restored = parsed.map((t) => ({
          ...t,
          deadline: t.deadline ? new Date(t.deadline) : null,
        }));
        setTodos(restored);
      } catch (e) {
        console.error("Failed to parse todos", e);
      }
    }
  }, []);

  /**保存処理 */
  React.useEffect(() => {
    if (!didInit.current) return;
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  /**表示モード（リスト or カレンダー） */
  const [viewMode, setViewMode] = React.useState<"list" | "calendar">("list");

  // フィルタ・検索・並べ替え
  const [filterStatus, setFilterStatus] = React.useState<FilterStatus>("all");
  const [filterSubject, setFilterSubject] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [sortOption, setSortOption] = React.useState<SortOption>("deadlineAsc");

  // 新規タスク用
  const [newName, setNewName] = React.useState<string>("");
  const [newSubject, setNewSubject] = React.useState<string>("国語3");
  const [newPriority, setNewPriority] = React.useState<number>(3);
  const [newDeadline, setNewDeadline] = React.useState<string>("");

  // Todo 操作
  const updateIsDone = (id: string, value: boolean) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, isDone: value } : t)));
  };

  const remove = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTodo = (updated: Todo) => {
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const addTodo = () => {
    if (newName.trim().length < 2 || newName.trim().length > 32) {
      alert("名前は2文字以上32文字以内で入力してください。");
      return;
    }

    const newTodo: Todo = {
      id: uuidv4(),
      name: newName.trim(),
      subject: newSubject,
      priority: newPriority,
      deadline: newDeadline ? new Date(newDeadline) : null,
      isDone: false,
      memo: newMemo,
    };

    setTodos((prev) => [...prev, newTodo]);
    setNewName("");
    setNewSubject(SUBJECTS[0]);
    setNewPriority(3);
    setNewDeadline("");
    setNewMemo("");
  };

  const removeCompletedTodos = () => {
    if (window.confirm("完了済みのタスクをすべて削除しますか？")) {
      setTodos((prev) => prev.filter((t) => !t.isDone));
    }
  };

  /**統計 */
  const totalCount = todos.length;
  const uncompletedCount = todos.filter((t) => !t.isDone).length;

  const todayCount = todos.filter((t) => {
    if (!t.deadline) return false;
    return dayjs(t.deadline).isSame(dayjs(), "day");
  }).length;

  const next7daysCount = todos.filter((t) => {
    if (!t.deadline) return false;
    return dayjs(t.deadline).isAfter(dayjs()) &&
           dayjs(t.deadline).isBefore(dayjs().add(7, "day"));
  }).length;

  /**フィルタ・検索・並び替え */
  const filteredTodos = todos
    .filter((t) => {
      if (filterStatus === "todo") {
        if (t.isDone) return false;
        if (t.deadline && dayjs(t.deadline).isBefore(dayjs())) return false;
      }
      if (filterStatus === "done" && !t.isDone) return false;
      if (filterStatus === "overdue" && !(t.deadline && dayjs(t.deadline).isBefore(dayjs()))) return false;

      if (filterSubject !== "all" && t.subject !== filterSubject) return false;

      if (searchQuery.trim() !== "" &&
        !t.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortOption === "deadlineAsc") {
        return (a.deadline?.getTime() ?? Infinity) - (b.deadline?.getTime() ?? Infinity);
      }
      if (sortOption === "deadlineDesc") {
        return (b.deadline?.getTime() ?? 0) - (a.deadline?.getTime() ?? 0);
      }
      if (sortOption === "priorityHigh") {
        return b.priority - a.priority;
      }
      if (sortOption === "priorityLow") {
        return a.priority - b.priority;
      }
      return 0;
    });

  /**UI*/
  return (
    <div className="mx-4 mt-10 max-w-5xl md:mx-auto">
      <h1 className="mb-4 text-2xl font-bold">3Iの為のTodoアプリ</h1>

      {/* 表示切り替えボタン */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setViewMode("list")}
          className={`px-3 py-1 rounded ${
            viewMode === "list" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          リスト表示
        </button>

        <button
          onClick={() => setViewMode("calendar")}
          className={`px-3 py-1 rounded ${
            viewMode === "calendar" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          カレンダー表示
        </button>
      </div>

      {/* 画面切替 */}
      {viewMode === "calendar" ? (
        <CalendarView
          todos={todos}
          onEventClick={(todo) => setSelectedTodo(todo)}
          onDateClick={(date) => setNewTaskDate(date)} 
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6">

            {/* 左カラム：タスクリスト */}
            <div className="flex-1">

              {/* フィルタ */}
              <div className="mb-4 flex flex-wrap gap-2">
                {FILTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`rounded px-3 py-1 ${
                      filterStatus === s
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {s === "all" && "すべて"}
                    {s === "todo" && "進行中"}
                    {s === "done" && "完了済み"}
                    {s === "overdue" && "期限切れ"}
                  </button>
                ))}
              </div>

              {/* 検索 */}
              <div className="mt-4 flex items-center gap-3">
                <div className="font-bold">検索</div>
                <input
                  type="text"
                  placeholder="タスク名で検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-md border border-slate-400 px-2 py-1"
                />
              </div>

              {/* 科目フィルタ */}
              <div className="mb-4 mt-4 flex items-center gap-2">
                <label className="font-bold">科目フィルタ:</label>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="rounded border p-1"
                >
                  <option value="all">すべて</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* 並び替え */}
              <div className="mt-4 flex items-center gap-3">
                <div className="font-bold">並べ替え</div>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="rounded border p-1"
                >
                  <option value="deadlineAsc">期限が早い順</option>
                  <option value="deadlineDesc">期限が遅い順</option>
                  <option value="priorityHigh">優先度が高い順</option>
                  <option value="priorityLow">優先度が低い順</option>
                </select>
              </div>

              {/* タスクリスト */}
              <div className="mt-4">
                <TodoList
                  todos={filteredTodos}
                  updateIsDone={updateIsDone}
                  remove={remove}
                  updateTodo={updateTodo}
                />
              </div>

              {/* 完了タスク削除 */}
              <button
                type="button"
                onClick={removeCompletedTodos}
                className="mt-3 rounded-md bg-red-500 px-3 py-1 font-bold text-white hover:bg-red-600"
              >
                完了済みのタスクを削除
              </button>
            </div>

            {/* 統計＋追加フォーム */}
            <div className="w-full md:w-80 space-y-4">

              {/* 統計 */}
              <div className="rounded-md border p-4">
                <WelcomeMessage
                  name="寝屋川タヌキ"
                  uncompletedCount={uncompletedCount}
                  totalCount={totalCount}
                  todayCount={todayCount}
                  next7daysCount={next7daysCount}
                />
              </div>

              {/* 新規追加 */}
              <div className="space-y-2 rounded-md border p-3">
                <h2 className="font-bold">新しいタスクの追加</h2>

                {/* 名前 */}
                <div>
                  <label className="font-bold">名前</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="2文字以上、32文字以内で入力"
                    className="mt-1 w-full rounded border px-2 py-1"
                  />
                </div>

                {/* 科目 */}
                <div>
                  <label className="font-bold">科目</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="mt-1 w-full rounded border px-2 py-1"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 優先度 */}
                <div>
                  <label className="font-bold">優先度</label>
                  <div className="mt-1 flex gap-4">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <label key={n} className="flex items-center gap-1">
                        <input
                          type="radio"
                          value={n}
                          checked={newPriority === n}
                          onChange={(e) => setNewPriority(Number(e.target.value))}
                        />
                        {n}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 期限 */}
                <div>
                  <label className="font-bold">期限</label>
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="mt-1 w-full rounded border px-2 py-1"
                  />
                </div>

                {/* メモ */}
                <div>
                  <label className="font-bold">メモ</label>
                  <textarea
                    value={newMemo}
                    onChange={(e) => setNewMemo(e.target.value)}
                    placeholder="任意でメモを入力できます"
                    className="mt-1 w-full rounded border px-2 py-1"
                    rows={3}
                  />
                </div>

                <button
                  type="button"
                  onClick={addTodo}
                  className="mt-3 w-full rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {selectedTodo && (
        <TodoDetailModal
          todo={selectedTodo}
          onClose={() => setSelectedTodo(null)}
          onUpdate={updateTodo}
          onRemove={remove}
        />
      )}
      {newTaskDate && (
        <NewTaskModal
          defaultDate={newTaskDate}
          onClose={() => setNewTaskDate(null)}
          onCreate={(data) => {
            const created: Todo = {
              id: uuidv4(),
              name: data.name,
              subject: data.subject,
              priority: data.priority,
              deadline: data.deadline,
              isDone: false,
              memo: data.memo ?? "",
              };
              setTodos((prev) => [...prev, created]);
              setNewTaskDate(null);
            }}
        />
      )}
    </div>
  );
};

export default App;
