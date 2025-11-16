import { useState, useEffect } from "react";
import type { Todo } from "./types";
import { initTodos } from "./initTodos";
import WelcomeMessage from "./WelcomeMessage";
import TodoList from "./TodoList";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge"; // ◀◀ 追加
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // ◀◀ 追加
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"; // ◀◀ 追加


const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoName, setNewTodoName] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState(3);
  const [newTodoDeadline, setNewTodoDeadline] = useState<Date | null>(null);
  const [newTodoNameError, setNewTodoNameError] = useState("");
  const [initialized, setInitialized] = useState(false); 
  const [newTodoSubject, setNewTodoSubject] = useState("国語3");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "expired">("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [sortMode, setSortMode] = useState<"deadline" | "priority">("deadline");
  const [searchText, setSearchText] = useState("");
  const localStorageKey = "TodoApp";

  useEffect(() => {
    const todoJsonStr = localStorage.getItem(localStorageKey);
    if (todoJsonStr && todoJsonStr !== "[]") {
      const storedTodos: Todo[] = JSON.parse(todoJsonStr);
      const convertedTodos = storedTodos.map((todo) => ({
        ...todo,
        deadline: todo.deadline ? new Date(todo.deadline) : null,
      }));
      setTodos(convertedTodos);
    } else {
      // LocalStorage にデータがない場合は initTodos をセットする
      setTodos(initTodos);
    }
    setInitialized(true);
  }, []);

  // 状態 todos または initialized に変更があったときTodoデータを保存
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(localStorageKey, JSON.stringify(todos));
    }
  }, [todos, initialized]);

  const uncompletedCount = todos.filter(
    (todo: Todo) => !todo.isDone
  ).length;

  // ▼▼ 追加
  const isValidTodoName = (name: string): string => {
    if (name.length < 2 || name.length > 32) {
      return "2文字以上、32文字以内で入力してください";
    } else {
      return "";
    }
  };

  const updateNewTodoName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoNameError(isValidTodoName(e.target.value)); // ◀◀ 追加
    setNewTodoName(e.target.value);
  };

  const updateNewTodoPriority = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoPriority(Number(e.target.value));
  };

  const updateDeadline = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dt = e.target.value; // UIで日時が未設定のときは空文字列 "" が dt に格納される
    console.log(`UI操作で日時が "${dt}" (${typeof dt}型) に変更されました。`);
    setNewTodoDeadline(dt === "" ? null : new Date(dt));
  };

  const addNewTodo = () => {
    // ▼▼ 編集
    const err = isValidTodoName(newTodoName);
    if (err !== "") {
      setNewTodoNameError(err);
      return;
    }
    const newTodo: Todo = {
      id: uuid(),
      name: newTodoName,
      isDone: false,
      priority: newTodoPriority,
      deadline: newTodoDeadline,
      subject: newTodoSubject,
    };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    setNewTodoName("");
    setNewTodoPriority(3);
    setNewTodoDeadline(null);
  };

  const updateIsDone = (id: string, value: boolean) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, isDone: value }; // スプレッド構文
      } else {
        return todo;
      }
    });
    setTodos(updatedTodos);
  };

  const removeCompletedTodos = () => {
    const updatedTodos = todos.filter((todo) => !todo.isDone);
    setTodos(updatedTodos);
  };

  const remove = (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
  };

  const updateTodo = (updated: Todo) => {
    setTodos((prev) => prev.map((t) =>
      t.id === updated.id ? updated : t
    ));
  };

  // ---- カウンター計算 ----
  const totalCount = todos.length;

  const todayCount = todos.filter((todo) => {
    if (!todo.deadline) return false;
    const dl = dayjs(todo.deadline);
    return dl.isSame(dayjs(), "day"); // 今日と同じ日
  }).length;

  const next7daysCount = todos.filter((todo) => {
    if (!todo.deadline) return false;
    const dl = dayjs(todo.deadline);
    return dl.isAfter(dayjs(), "day") && dl.diff(dayjs(), "day") <= 7;
  }).length;

  const filteredTodos = todos
    .filter((todo) => {
      const now = dayjs();
      if (filter === "active") {
        const isExpired =
          todo.deadline !== null && dayjs(todo.deadline).isBefore(now);
        if (todo.isDone || isExpired) return false;
      }
      if (filter === "completed") {
        if (!todo.isDone) return false;
      }
      if (filter === "expired") {
        const isExpired =
          todo.deadline !== null && dayjs(todo.deadline).isBefore(now);
        if (!isExpired || todo.isDone) return false;
      }
      if (subjectFilter !== "all") {
        if (todo.subject !== subjectFilter) return false;
      }
      if (searchText.trim() !== "") {
        if (!todo.name.toLowerCase().includes(searchText.toLowerCase())) {
          return false;
        }
      }
      return true; // "all"
    })
    .sort((a, b) => {
    // ソートモード：期限昇順
      if (sortMode === "deadline") {
        if (a.deadline === null && b.deadline === null) return 0;
        if (a.deadline === null) return 1;
        if (b.deadline === null) return -1;
        return dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf();
      }

      // ソートモード：優先度（数値が低い方が高優先度 → 1 が最上）
      if (sortMode === "priority") {
        return a.priority - b.priority;
      }

      return 0;
    });

  const SUBJECTS = [
    "国語3",
    "社会3",
    "解析1",
    "解析2",
    "線形代数・微分方程式",
    "基礎物理3",
    "保健・体育3",
    "英語5",
    "英語表現3",
    "情報3",
    "プログラミング2",
    "プログラミング3",
    "アルゴリズムとデータ構造1",
    "論理回路2",
    "電気電子回路1",
    "知識科学概論",
    "知能情報実験実習1",
    "応用専門概論",
    "応用専門PBL1",
    "その他",
  ];

  return (
    <div className="mx-4 mt-10 max-w-2xl md:mx-auto">
      <h1 className="mb-4 text-2xl font-bold">TodoApp</h1>
      <div className="mb-4">
        <WelcomeMessage
          name="寝屋川タヌキ"
          uncompletedCount={uncompletedCount}
          totalCount={totalCount}
          todayCount={todayCount}
          next7daysCount={next7daysCount}
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={twMerge(
            "rounded-md px-3 py-1 font-bold border",
            filter === "all" ? "bg-indigo-500 text-white" : "bg-white"
          )}
        >
          すべて
        </button>
        <button
          onClick={() => setFilter("active")}
          className={twMerge(
            "rounded-md px-3 py-1 font-bold border",
            filter === "active" ? "bg-indigo-500 text-white" : "bg-white"
          )}
        >
          進行中
        </button>

        <button
          onClick={() => setFilter("completed")}
          className={twMerge(
            "rounded-md px-3 py-1 font-bold border",
            filter === "completed" ? "bg-indigo-500 text-white" : "bg-white"
          )}
        >
          完了済み
        </button>

        <button
          onClick={() => setFilter("expired")}
          className={twMerge(
            "rounded-md px-3 py-1 font-bold border",
            filter === "expired" ? "bg-red-500 text-white" : "bg-white"
          )}
        >
          期限切れ
        </button>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <label className="font-bold">検索</label>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="タスク名で検索"
          className="rounded-md border border-gray-400 px-2 py-1 grow"
        />
      </div>
      <div className="mb-4 flex items-center gap-2">
        <span className="font-bold">科目フィルタ:</span>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="rounded-md border border-gray-400 px-2 py-1"
        >
          <option value="all">すべて</option>

          {SUBJECTS.map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <label className="font-bold">並べ替え</label>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as "deadline" | "priority")}
          className="rounded-md border border-gray-400 px-2 py-1"
        >
          <option value="deadline">期限が早い順</option>
          <option value="priority">優先度が高い順</option>
        </select>
      </div>
      <TodoList todos={filteredTodos} updateIsDone={updateIsDone} remove={remove} updateTodo={updateTodo}/>
      <button
        type="button"
        onClick={removeCompletedTodos}
        className="mt-3 rounded-md bg-red-500 px-3 py-1 font-bold text-white hover:bg-red-600"
      >
        完了済みのタスクを削除
      </button>
      <div className="mt-5 space-y-2 rounded-md border p-3">
        <h2 className="text-lg font-bold">新しいタスクの追加</h2>
        {/* 編集: ここから... */}
        <div>
          <div className="flex items-center space-x-2">
            <label className="font-bold" htmlFor="newTodoName">
              名前
            </label>
            <input
              id="newTodoName"
              type="text"
              value={newTodoName}
              onChange={updateNewTodoName}
              className={twMerge(
                "grow rounded-md border p-2",
                newTodoNameError && "border-red-500 outline-red-500"
              )}
              placeholder="2文字以上、32文字以内で入力してください"
            />
          </div>
          {newTodoNameError && (
            <div className="ml-10 flex items-center space-x-1 text-sm font-bold text-red-500">
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="mr-0.5"
              />
              <div>{newTodoNameError}</div>
            </div>
          )}
        </div>
        {/* ...ここまで */}

        <div className="flex items-center gap-x-2">
          <label htmlFor="subject" className="font-bold">
            科目
          </label>
          <select
            value={newTodoSubject}
            onChange={(e) => setNewTodoSubject(e.target.value)}
            className="rounded-md border border-gray-400 px-2 py-1"
          >
            {SUBJECTS.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-5">
          <div className="font-bold">優先度</div>
          {[1, 2, 3].map((value) => (
            <label key={value} className="flex items-center space-x-1">
              <input
                id={`priority-${value}`}
                name="priorityGroup"
                type="radio"
                value={value}
                checked={newTodoPriority === value}
                onChange={updateNewTodoPriority}
              />
              <span>{value}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-x-2">
          <label htmlFor="deadline" className="font-bold">
            期限
          </label>
          <input
            type="datetime-local"
            id="deadline"
            value={
              newTodoDeadline
                ? dayjs(newTodoDeadline).format("YYYY-MM-DDTHH:mm:ss")
                : ""
            }
            onChange={updateDeadline}
            className="rounded-md border border-gray-400 px-2 py-0.5"
          />
        </div>

        <button
          type="button"
          onClick={addNewTodo}
          className={twMerge(
            "rounded-md bg-indigo-500 px-3 py-1 font-bold text-white hover:bg-indigo-600",
            newTodoNameError && "cursor-not-allowed opacity-50"
          )}
        >
          追加
        </button>
      </div>
    </div>
  );
};

export default App;
