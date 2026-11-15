"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Unit = {
  id: string;
  name: string;
  capacity: number;
  property_id: string;
};

type Property = {
  id: string;
  name: string;
};

export default function UnitList() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadUnits = async () => {
      const { data, error } = await supabase
        .from("units")
        .select("id, name, capacity, property_id")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("Erreur : " + error.message);
        setLoading(false);
        return;
      }

      const unitData = data ?? [];
      setUnits(unitData);

      const propertyIds = [
        ...new Set(unitData.map((unit) => unit.property_id)),
      ];

      if (propertyIds.length > 0) {
        const { data: propertyData, error: propertyError } =
          await supabase
            .from("properties")
            .select("id, name")
            .in("id", propertyIds);

        if (propertyError) {
          setMessage("Erreur : " + propertyError.message);
        } else {
          setProperties(propertyData ?? []);
        }
      }

      setLoading(false);
    };

    loadUnits();
  }, []);

  return (
    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Mes logements</h2>

      {loading && (
        <p className="mt-4 text-sm text-gray-500">
          Chargement des logements...
        </p>
      )}

      {!loading && message && (
        <p className="mt-4 text-sm text-red-600">{message}</p>
      )}

      {!loading && !message && units.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">
          Aucun logement enregistré pour le moment.
        </p>
      )}

      {!loading && !message && units.length > 0 && (
        <div className="mt-5 space-y-3">
          {units.map((unit) => {
            const property = properties.find(
              (item) => item.id === unit.property_id
            );

            return (
              <div
                key={unit.id}
                className="rounded-xl border border-gray-200 p-4"
              >
                <h3 className="font-semibold">{unit.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Gîte : {property?.name ?? "Gîte introuvable"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Capacité : {unit.capacity} personne(s)
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
