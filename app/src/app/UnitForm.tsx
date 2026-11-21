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
    <section className="mt-5 rounded-2xl border border-[#e2e7ef] bg-white p-5 sm:p-7 shadow-[0_8px_30px_rgba(23,45,77,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_35px_rgba(23,45,77,0.08)]">
    <h2 className="text-xl font-semibold tracking-tight text-[#171d29]">Ajouter un logement</h2>
      <p className="mt-2 text-sm text-gray-500">
        Ajoutez une chambre, un studio, un appartement ou une unité à votre établissement.
      </p>

      <form onSubmit={createUnit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Établissement
          </label>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            required
            className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
          >
            <option value="">Choisir un établissement</option>
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
          className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
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
            className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
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
          className="w-full sm:w-auto rounded-xl bg-[#172d4d] px-6 py-3 font-medium text-white shadow-sm transition duration-200 hover:bg-[#29466b] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
