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
  setMessage("Gîte modifié avec succès !");
};
const deleteProperty = async (property: Property) => {
  const confirmed = window.confirm(
    `Veux-tu vraiment supprimer le gîte "${property.name}" ?`
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
      "Suppression impossible : ce gîte possède encore des logements, réservations ou tâches."
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

  setMessage("Gîte supprimé avec succès !");
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
    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Mes gîtes</h2>

      {loading && (
        <p className="mt-4 text-sm text-gray-500">
          Chargement des gîtes...
        </p>
      )}

      {!loading && message && (
        <p className="mt-4 text-sm text-red-600">{message}</p>
      )}

      {!loading && !message && properties.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">
          Aucun gîte enregistré pour le moment.
        </p>
      )}

      {!loading && properties.length > 0 && (
        <div className="mt-5 space-y-3">
          {properties.map((property) => (
            <div
              key={property.id}
              className="rounded-xl border border-gray-200 p-4"
            >
              {editingId === property.id ? (
  <div className="space-y-3">
    <input
      type="text"
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      placeholder="Nom du gîte"
      className="w-full rounded-lg border p-2"
    />

    <input
      type="text"
      value={editAddress}
      onChange={(e) => setEditAddress(e.target.value)}
      placeholder="Adresse"
      className="w-full rounded-lg border p-2"
    />

    <select
      value={editTimezone}
      onChange={(e) => setEditTimezone(e.target.value)}
      className="w-full rounded-lg border p-2"
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
        className="rounded-lg bg-green-700 px-4 py-2 text-white"
      >
        Enregistrer
      </button>

      <button
        onClick={() => setEditingId(null)}
        className="rounded-lg border px-4 py-2"
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
      className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm"
    >
      Modifier
    </button>
    <button
  onClick={() => deleteProperty(property)}
  className="ml-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
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