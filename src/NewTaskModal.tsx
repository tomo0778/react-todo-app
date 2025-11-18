import React from "react";
import dayjs from "dayjs";
import { SUBJECT_COLORS } from "./colors";

type NewTaskData = {
  name: string;
  subject: string;
  priority: number;
  deadline: Date | null;
  memo?: string;
};

type Props = {
  defaultDate: Date;
  onClose: () => void;
  onCreate: (data: NewTaskData) => void;
};

const NewTaskModal: React.FC<Props> = ({ defaultDate, onClose, onCreate }) => {
  const [name, setName] = React.useState("");
  const [subject, setSubject] = React.useState(Object.keys(SUBJECT_COLORS)[0] ?? "その他");
  const [priority, setPriority] = React.useState<number>(3);
  const [deadline, setDeadline] = React.useState<string>(
    defaultDate ? dayjs(defaultDate).format("YYYY-MM-DDTHH:mm") : ""
  );
  const [memo, setMemo] = React.useState<string>("");

  const handleCreate = () => {
    if (name.trim().length < 2) {
      alert("名前は2文字以上で入力してください。");
      return;
    }
    onCreate({
      name: name.trim(),
      subject,
      priority,
      deadline: deadline ? new Date(deadline) : null,
      memo,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={onClose}>
      <div className="bg-white rounded-lg p-5 w-[90%] max-w-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">新しいタスク</h2>

        <div className="mb-3">
          <label className="font-bold">名前</label>
          <input className="w-full border rounded p-2 mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="font-bold">科目</label>
          <select className="w-full border rounded p-2 mt-1" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {Object.keys(SUBJECT_COLORS).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="font-bold">優先度</label>
          <div className="mt-1 flex gap-3">
            {[1,2,3,4,5].map(v => (
              <label key={v} className="flex items-center gap-1">
                <input type="radio" value={v} checked={priority===v} onChange={() => setPriority(v)} />
                {v}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="font-bold">期限</label>
          <input
            type="datetime-local"
            className="w-full border rounded p-2 mt-1"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="font-bold">メモ</label>
          <textarea className="w-full border rounded p-2 mt-1" rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-400 text-white rounded" onClick={onClose}>キャンセル</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleCreate}>作成</button>
        </div>
      </div>
    </div>
  );
};

export default NewTaskModal;

