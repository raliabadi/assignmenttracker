import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { BiEdit } from "react-icons/bi";
import { AiTwotoneDelete } from "react-icons/ai";
import { createAssignment, getAssignments, deleteAssignment, updateAssignment } from "#/lib/assignments";
import { Spinner, buttonClass } from "#/components/spinner";

export const Route = createFileRoute("/_auth/dashboard")({
  loader: async ({ context }) => {
    const assignments = await getAssignments();
    return { user: context.user, assignments };
  },
  component: Dashboard,
});

const inputClass =
  "block w-full border border-neutral-300 dark:border-neutral-700 px-3 py-2 bg-transparent";

function Dashboard() {
  const { user, assignments } = Route.useLoaderData();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [pending, setPending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  async function onCreate(e: React.SubmitEvent) {
    e.preventDefault();
    setPending(true);
    await createAssignment({ data: { title, dueDate } });
    setTitle("");
    setDueDate("");
    setDirty(false);
    await router.invalidate();
    setPending(false);
  }

  async function onUpdate(e: React.SubmitEvent) {
    e.preventDefault();
    setPending(true);
    await updateAssignment({ data: { id: selectedItem!, title, dueDate } });
    setTitle("");
    setDueDate("");
    setEditing(false);
    setSelectedItem(null);
    setDirty(false);
    await router.invalidate();
    setPending(false);
  }

  async function handleDelete(id: number) {
    // TODO: Implement delete functionality
    if (confirm("Are you sure you want to delete this assignment?")) {
      await deleteAssignment({ data: { id } });
      await router.invalidate();
    }
  }

  async function handleEdit(id: number, title: string, dueDate: string) {
    setSelectedItem(id);
    setTitle(title);

    // Convert dueDate to a format suitable for the input[type="datetime-local"]
    const localDueDate = new Date(dueDate);

    // Convert timezone offset from minutes to milliseconds
    const tzOffset = localDueDate.getTimezoneOffset() * 60000;

    // Subtract the offset and output the ISO string, dropping the "Z"
    const formattedDueDate = new Date(localDueDate.getTime() - tzOffset).toISOString().slice(0, -1);

    setDueDate(formattedDueDate);

    setEditing(true);
    await router.invalidate();
  }

  return (
    <div className="p-1 max-w-md space-y-6 bg-neutral-100 dark:bg-neutral-900 rounded-md">
      <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
      <h2 className="text-1xl font-semibold">Using this app you can maintain a list of assignments and their due dates</h2>

      <form onSubmit={editing ? onUpdate : onCreate} className="border-t space-y-3">
        {editing ? (
          <h2 className="text-2xl font-semibold">Edit assignment #{selectedItem}</h2>
        ) : (
          <h2 className="text-2xl font-semibold">New assignment</h2>
        )}
        <input
          className={inputClass}
          placeholder="Title"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
          required
        />
        <input
          className={inputClass}
          type="datetime-local"
          value={dueDate}
          onChange={(e) => { setDueDate(e.target.value); setDirty(true); }}
          required
        />
        <button disabled={pending || !dirty} className={buttonClass}>
          {pending && <Spinner />}
          {editing ? "Update Assignment" : "Add Assignment"}
        </button>
      </form>

      <section className="border-t space-y-2">
        <h2 className="text-2xl font-semibold">Your assignments</h2>
        {assignments.length === 0 ? (
          <p>No assignments yet.</p>
        ) : (
          <ul className="space-y-1">
            {assignments.map((a) => (
              <li key={a.id} className="border-b border-neutral-200 dark:border-neutral-800 py-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{a.title}</span> — due{" "}
                  <span className={new Date(a.dueDate).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 ? 'text-red-600 font-semibold' : 'text-gray-700'}>{new Date(a.dueDate).toLocaleString()}</span>
                  <button aria-label="Delete" onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-700 cursor-pointer">
                    <AiTwotoneDelete />
                  </button>
                  <button aria-label="Edit" onClick={() => handleEdit(a.id, a.title, a.dueDate.toLocaleString())} className="text-blue-400 hover:text-blue-700 cursor-pointer">
                    <BiEdit />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
