"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Property = {
  id: string;
  name: string;
};

export default function UnitForm() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("2");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, name")
        .order("name");

      if (error) {
        setMessage("Erreur : " + error.message);
        return;
      }

      setProperties(data ?? []);

      if (data && data.length === 1) {
        setPropertyId(data[0].id);
      }
    };

    loadProperties();
  }, []);

  const createUnit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("units").insert({
      property_id: propertyId,
      name: name.trim(),
      capacity: Number(capacity),
    });

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage("Logement ajouté avec succès !");
      setName("");
      setCapacity("2");
    }

    setLoading(false);
  };

  return (
    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Ajouter un logement</h2>
      <p className="mt-2 text-sm text-gray-500">
        Ajoutez une chambre, un studio ou un appartement à votre gîte.
      </p>

      <form onSubmit={createUnit} className="mt-5 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Gîte
          </label>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          >
            <option value="">Choisir un gîte</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du logement"
          required
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        />

        <div>
          <label className="mb-2 block text-sm font-medium">
            Capacité (personnes)
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          />
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            !propertyId ||
            !name.trim() ||
            !capacity ||
            Number(capacity) < 1
          }
          className="rounded-xl bg-emerald-800 px-5 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Création..." : "Ajouter mon logement"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
