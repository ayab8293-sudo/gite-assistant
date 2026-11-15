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
              <h3 className="font-semibold">{property.name}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {property.address}
              </p>
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