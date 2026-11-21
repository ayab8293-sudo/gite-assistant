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
    <section className="mt-5 rounded-2xl border border-[#e2e7ef] bg-white p-5 sm:p-7 shadow-[0_8px_30px_rgba(23,45,77,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_35px_rgba(23,45,77,0.08)]">
<h2 className="text-xl font-semibold tracking-tight text-[#171d29]">Mes logements</h2>
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
        <div className="mt-6 space-y-4">
          {units.map((unit) => {
            const property = properties.find(
              (item) => item.id === unit.property_id
            );

            return (
              <div
                key={unit.id}
                className="rounded-xl border border-[#e2e7ef] bg-white p-5 transition duration-200 hover:border-[#c5d2e2] hover:shadow-sm"
              >
                <h3 className="font-semibold">{unit.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Établissement : {property?.name ?? "Établissement introuvable"}
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
