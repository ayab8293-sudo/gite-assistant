"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Task = {
  id: string;
  property_id: string;
  unit_id: string | null;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  due_at: string | null;
};

type Property = {
  id: string;
  name: string;
};

type Unit = {
  id: string;
  name: string;
};
type Member = {
  id: string;
  full_name: string;
};
export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
const [assignments, setAssignments] = useState<
  { task_id: string; user_id: string }[]
>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
const updateTaskStatus = async (taskId: string, newStatus: string) => {
  const { error } = await supabase
    .from("tasks")
    .update({ status: newStatus })
    .eq("id", taskId);

  if (error) {
    setMessage("Erreur : " + error.message);
    return;
  }

  setTasks((currentTasks) =>
    currentTasks.map((task) =>
      task.id === taskId
        ? { ...task, status: newStatus }
        : task
    )
  );
};
  
useEffect(() => {
  const loadTasks = async () => {
    const [
      { data: tasksData, error: tasksError },
      { data: propertiesData, error: propertiesError },
      { data: unitsData, error: unitsError },
      { data: assignmentsData, error: assignmentsError },
      { data: membersData, error: membersError },
    ] = await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("properties").select("id, name"),
      supabase.from("units").select("id, name"),
      supabase.from("task_assignments").select("task_id, user_id"),
      supabase.from("profiles").select("id, full_name"),
    ]);

    if (
      tasksError ||
      propertiesError ||
      unitsError ||
      assignmentsError ||
      membersError
    ) {
      setMessage(
        "Erreur : " +
          (tasksError?.message ||
            propertiesError?.message ||
            unitsError?.message ||
            assignmentsError?.message ||
            membersError?.message)
      );
      setLoading(false);
      return;
    }

    setTasks(tasksData ?? []);
    setProperties(propertiesData ?? []);
    setUnits(unitsData ?? []);
    setAssignments(assignmentsData ?? []);
    setMembers(membersData ?? []);
    setLoading(false);
  };

  loadTasks();
}, []);


  const getPropertyName = (id: string) =>
    properties.find((property) => property.id === id)?.name ?? "Gîte inconnu";

  const getUnitName = (id: string | null) =>
    units.find((unit) => unit.id === id)?.name ?? "Non précisé";
const getAssignedMemberName = (taskId: string) => {
  const assignment = assignments.find(
    (item) => item.task_id === taskId
  );

  if (!assignment) return "Non attribuée";

  return (
    members.find((member) => member.id === assignment.user_id)
      ?.full_name || "Membre inconnu"
  );
};
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      cleaning: "Ménage",
      maintenance: "Maintenance",
      preparation: "Préparation",
      supplies: "Fournitures",
      other: "Autre",
    };

    return labels[category] ?? category;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "En attente",
      in_progress: "En cours",
      completed: "Terminée",
    };

    return labels[status] ?? status;
  };

  const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    low: "Basse",
    normal: "Normale",
    high: "Haute",
    critical: "Critique",
  };

  return labels[priority] ?? priority;
};

  return (
    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Mes tâches</h2>
      <p className="mt-2 text-sm text-gray-500">
        Retrouvez les opérations à effectuer dans vos établissements.
      </p>

      {loading && (
        <p className="mt-4 text-sm text-gray-500">
          Chargement des tâches...
        </p>
      )}

      {message && (
        <p className="mt-4 text-sm text-red-600">{message}</p>
      )}

      {!loading && !message && tasks.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">
          Aucune tâche pour le moment.
        </p>
      )}

      <div className="mt-5 space-y-4">
        {tasks.map((task) => (
          <article
            key={task.id}
            className="rounded-xl border border-gray-200 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{task.title}</h3>
              <select
  value={task.status}
  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
  className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium"
>
  <option value="pending">En attente</option>
  <option value="in_progress">En cours</option>
  <option value="completed">Terminée</option>
</select>
            </div>

            <p className="mt-3 text-sm text-gray-600">
              <strong>Gîte :</strong> {getPropertyName(task.property_id)}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              <strong>Logement :</strong> {getUnitName(task.unit_id)}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              <strong>Catégorie :</strong> {getCategoryLabel(task.category)}
            </p>
<p className="mt-1 text-sm text-gray-600">
  <strong>Attribuée à :</strong> {getAssignedMemberName(task.id)}
</p>
            <p className="mt-1 text-sm text-gray-600">
              <strong>Priorité :</strong> {getPriorityLabel(task.priority)}
            </p>

            {task.due_at && (
              <p className="mt-1 text-sm text-gray-600">
                <strong>Date limite :</strong>{" "}
                {new Date(task.due_at).toLocaleString("fr-FR")}
              </p>
            )}

            {task.description && (
              <p className="mt-2 text-sm text-gray-500">
                <strong>Description :</strong> {task.description}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
