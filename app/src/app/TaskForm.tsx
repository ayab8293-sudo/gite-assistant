"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Property = {
  id: string;
  name: string;
  organization_id: string;
};

type Unit = {
  id: string;
  name: string;
  property_id: string;
};

export default function TaskForm() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("cleaning");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("normal");
  const [dueAt, setDueAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const loadMembers = async (selectedPropertyId: string) => {
  const selectedProperty = properties.find(
    (property) => property.id === selectedPropertyId
  );

  if (!selectedProperty) {
    setMembers([]);
    return;
  }

  const { data: membersData, error: membersError } = await supabase
    .from("memberships")
    .select("user_id, role")
    .eq("organization_id", selectedProperty.organization_id);

  if (membersError) {
    setMessage("Erreur membres : " + membersError.message);
    return;
  }

  const userIds = (membersData ?? []).map((member) => member.user_id);

  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);

  if (profilesError) {
    setMessage("Erreur profils : " + profilesError.message);
    return;
  }

  setMembers(profilesData ?? []);
};

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, name, organization_id")
        .order("name");

      if (error) {
        setMessage("Erreur : " + error.message);
        return;
      }

      setProperties(data ?? []);

      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("id, name, property_id")
        .order("name");

      if (unitsError) {
        setMessage("Erreur : " + unitsError.message);
        return;
      }

      setUnits(unitsData ?? []);
      
    };

    loadData();
  }, []);

  
const createTask = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    setMessage("Vous devez être connecté.");
    setLoading(false);
    return;
  }

  const { data: taskData, error } = await supabase
    .from("tasks")
    .insert({
      property_id: propertyId,
      unit_id: unitId || null,
      reservation_id: null,
      title: title.trim(),
      description: description.trim() || null,
      category,
      status,
      priority,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    setMessage("Erreur : " + error.message);
    setLoading(false);
    return;
  }

  if (assignedUserId) {
    const { error: assignmentError } = await supabase
      .from("task_assignments")
      .insert({
        task_id: taskData.id,
        user_id: assignedUserId,
        assigned_by: user.id,
      });

    if (assignmentError) {
      setMessage(
        "Tâche créée, mais attribution impossible : " +
          assignmentError.message
      );
      setLoading(false);
      return;
    }
  }

  setMessage(
    assignedUserId
      ? "Tâche créée et attribuée avec succès !"
      : "Tâche créée avec succès !"
  );

  setUnitId("");
  setAssignedUserId("");
  setTitle("");
  setDescription("");
  setCategory("cleaning");
  setStatus("pending");
  setPriority("normal");
  setDueAt("");

  setLoading(false);
};


  const availableUnits = units.filter(
    (unit) => unit.property_id === propertyId
  );

  return (
    <section className="mt-5 rounded-2xl border border-[#e2e7ef] bg-white p-5 sm:p-7 shadow-[0_8px_30px_rgba(23,45,77,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_35px_rgba(23,45,77,0.08)]">
      <h2 className="text-xl font-semibold tracking-tight text-[#171d29]">Créer une tâche</h2>
      <p className="mt-2 text-sm text-gray-500">
        Organisez les opérations de votre établissement.
      </p>

      <form onSubmit={createTask} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Établissement</label>
          <select
            value={propertyId}
            onChange={(e) => {
  const selectedId = e.target.value;
  setPropertyId(selectedId);
  setUnitId("");
  loadMembers(selectedId);
}}
            required
            className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">Choisir un établissement</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Logement (facultatif)
          </label>
          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            disabled={!propertyId}
            className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">Aucun logement précis</option>
            {availableUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
                </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Attribuer à (facultatif)
          </label>
          <select
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
            disabled={!propertyId}
            className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">Personne (non attribuée)</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name || "Membre sans nom"}
              </option>
            ))}
          </select>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de la tâche"
          required
          className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (facultatif)"
          rows={3}
          className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
        />

        <div>
          <label className="mb-2 block text-sm font-medium">Catégorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
          >
            <option value="cleaning">Ménage</option>
            <option value="maintenance">Maintenance</option>
            <option value="preparation">Préparation</option>
            <option value="supplies">Fournitures</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Statut</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
          >
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminée</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Priorité</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
          >
            <option value="low">Basse</option>
<option value="normal">Normale</option>
<option value="high">Haute</option>
<option value="critical">Critique</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Date limite (facultative)
          </label>
          <input
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
          />
        </div>

        <button
  type="submit"
  disabled={loading || !propertyId || !title.trim()}
  className="w-full sm:w-auto rounded-xl bg-[#172d4d] px-6 py-3 font-medium text-white shadow-sm transition duration-200 hover:bg-[#29466b] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
>
  {loading ? "Création..." : "Créer la tâche"}
</button>
      </form>

      {message && (
        <p className="mt-4 text-sm" role="status">{message}</p>
      )}
    </section>
  );
}
