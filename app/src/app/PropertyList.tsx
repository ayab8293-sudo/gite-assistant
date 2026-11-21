"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Property = {
  id: string;
  name: string;
  address: string;
  timezone: string;
};

export default function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
const [editingId, setEditingId] = useState<string | null>(null);
const [editName, setEditName] = useState("");
const [editAddress, setEditAddress] = useState("");
const [editTimezone, setEditTimezone] = useState("Europe/Paris");

const timezones = Intl.supportedValuesOf("timeZone");
const startEditing = (property: Property) => {
  setEditingId(property.id);
  setEditName(property.name);
  setEditAddress(property.address);
  setEditTimezone(property.timezone);
  setMessage("");
};
const updateProperty = async (propertyId: string) => {
  setMessage("");

  if (!editName.trim() || !editAddress.trim()) {
    setMessage("Le nom et l'adresse sont obligatoires.");
    return;
  }

  const { error } = await supabase
    .from("properties")
    .update({
      name: editName.trim(),
      address: editAddress.trim(),
      timezone: editTimezone,
    })
    .eq("id", propertyId);

  if (error) {
    setMessage("Erreur : " + error.message);
    return;
  }

  setProperties((current) =>
    current.map((property) =>
      property.id === propertyId
        ? {
            ...property,
            name: editName.trim(),
            address: editAddress.trim(),
            timezone: editTimezone,
          }
        : property
    )
  );

  setEditingId(null);
  setMessage("Établissement modifié avec succès !");
};
const deleteProperty = async (property: Property) => {
  const confirmed = window.confirm(
    `Veux-tu vraiment supprimer cet établissement "${property.name}" ?`
  );

  if (!confirmed) return;

  setMessage("");

  const [unitsCheck, reservationsCheck, tasksCheck] =
    await Promise.all([
      supabase
        .from("units")
        .select("id")
        .eq("property_id", property.id)
        .limit(1),

      supabase
        .from("reservations")
        .select("id")
        .eq("property_id", property.id)
        .limit(1),

      supabase
        .from("tasks")
        .select("id")
        .eq("property_id", property.id)
        .limit(1),
    ]);

  if (unitsCheck.error || reservationsCheck.error || tasksCheck.error) {
    setMessage("Impossible de vérifier les données associées.");
    return;
  }

  if (
    unitsCheck.data?.length ||
    reservationsCheck.data?.length ||
    tasksCheck.data?.length
  ) {
    setMessage(
      "Suppression impossible : cet établissement possède encore des unités, réservations ou tâches."
    );
    return;
  }

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", property.id);

  if (error) {
    setMessage("Erreur : " + error.message);
    return;
  }

  setProperties((current) =>
    current.filter((item) => item.id !== property.id)
  );

  setMessage("Établissement supprimé avec succès !");
};
  useEffect(() => {
    const loadProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, name, address, timezone")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("Erreur : " + error.message);
      } else {
        setProperties(data ?? []);
      }

      setLoading(false);
    };

    loadProperties();
  }, []);

  return (
    <section className="mt-5 rounded-2xl border border-[#e2e7ef] bg-white p-5 sm:p-7 shadow-[0_8px_30px_rgba(23,45,77,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_35px_rgba(23,45,77,0.08)]">
<h2 className="text-xl font-semibold tracking-tight text-[#171d29]">Mes établissements</h2>
      {loading && (
        <p className="mt-4 text-sm text-gray-500">
          Chargement des établissements...
        </p>
      )}

      {!loading && message && (
        <p className="mt-4 text-sm text-red-600">{message}</p>
      )}

      {!loading && !message && properties.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">
          Aucun établissement enregistré pour le moment.
        </p>
      )}

      {!loading && properties.length > 0 && (
        <div className="mt-6 space-y-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className="rounded-xl border border-[#e2e7ef] bg-white p-5 transition duration-200 hover:border-[#c5d2e2] hover:shadow-sm"
              >
              {editingId === property.id ? (
  <div className="space-y-3">
    <input
      type="text"
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      placeholder="Nom de l'établissement"
      className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
    />

    <input
      type="text"
      value={editAddress}
      onChange={(e) => setEditAddress(e.target.value)}
      placeholder="Adresse"
      className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
    />

    <select
      value={editTimezone}
      onChange={(e) => setEditTimezone(e.target.value)}
      className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
    >
      {timezones.map((zone) => (
        <option key={zone} value={zone}>
          {zone}
        </option>
      ))}
    </select>

    <div className="flex gap-2">
      <button
        onClick={() => updateProperty(property.id)}
        className="rounded-xl bg-[#172d4d] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-[#29466b] hover:shadow-md"
      >
        Enregistrer
      </button>

      <button
        onClick={() => setEditingId(null)}
        className="rounded-xl border border-[#d5dbe4] bg-white px-5 py-2.5 text-sm font-medium text-[#39465a] transition duration-200 hover:bg-slate-50 hover:border-[#aebdce]"
      >
        Annuler
      </button>
    </div>
  </div>
) : (
  <>
    <h3 className="font-semibold">{property.name}</h3>
    <p className="mt-1 text-sm text-gray-500">
      {property.address}
    </p>
    <p className="mt-1 text-xs text-gray-400">
      Fuseau horaire : {property.timezone}
    </p>

    <button
      onClick={() => startEditing(property)}
      className="mt-3 block w-full sm:inline-block sm:w-auto rounded-xl border border-[#d5dbe4] bg-white px-5 py-2.5 text-sm font-medium text-[#39465a] transition duration-200 hover:border-[#5279a8] hover:bg-slate-50"
    >
      Modifier
    </button>
    <button
  onClick={() => deleteProperty(property)}
  className="mt-2 block w-full sm:ml-2 sm:mt-0 sm:inline-block sm:w-auto rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-600 transition duration-200 hover:bg-red-50"
>
  Supprimer
</button>
  </>
)}
              <p className="mt-1 text-xs text-gray-400">
                Fuseau horaire : {property.timezone}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}