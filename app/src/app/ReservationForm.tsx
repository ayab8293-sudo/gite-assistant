"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Property = {
  id: string;
  name: string;
};

type Unit = {
  id: string;
  name: string;
  property_id: string;
};

export default function ReservationForm() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [reference, setReference] = useState("");
  const [guestLabel, setGuestLabel] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [status, setStatus] = useState("pending");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const { data: propertiesData, error: propertiesError } =
        await supabase
          .from("properties")
          .select("id, name")
          .order("name");

      if (propertiesError) {
        setMessage("Erreur : " + propertiesError.message);
        return;
      }

      setProperties(propertiesData ?? []);

      const { data: unitsData, error: unitsError } =
        await supabase
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

  const createReservation = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (checkOut <= checkIn) {
      setMessage("La date de départ doit être après la date d'arrivée.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("reservations").insert({
      property_id: propertyId,
      unit_id: unitId,
      reference: reference.trim() || null,
      guest_label: guestLabel.trim(),
      check_in: checkIn,
      check_out: checkOut,
      status,
      note: note.trim() || null,
    });

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage("Réservation créée avec succès !");
      setUnitId("");
      setReference("");
      setGuestLabel("");
      setCheckIn("");
      setCheckOut("");
      setStatus("pending");
      setNote("");
    }

    setLoading(false);
  };

  const availableUnits = units.filter(
    (unit) => unit.property_id === propertyId
  );

  return (
    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Ajouter une réservation</h2>
      <p className="mt-2 text-sm text-gray-500">
        Enregistrez une nouvelle réservation.
      </p>

      <form onSubmit={createReservation} className="mt-5 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Gîte
          </label>
          <select
            value={propertyId}
            onChange={(e) => {
              setPropertyId(e.target.value);
              setUnitId("");
            }}
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

        <div>
          <label className="mb-2 block text-sm font-medium">
            Logement
          </label>
          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            required
            disabled={!propertyId}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          >
            <option value="">Choisir un logement</option>
            {availableUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>

        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Référence de réservation (facultatif)"
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        />

        <input
          value={guestLabel}
          onChange={(e) => setGuestLabel(e.target.value)}
          placeholder="Nom ou libellé du client"
          required
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        />

        <div>
          <label className="mb-2 block text-sm font-medium">
            Date d'arrivée
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Date de départ
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Statut
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          >
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="cancelled">Annulée</option>
            <option value="completed">Terminée</option>
          </select>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (facultatif)"
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
          rows={3}
        />

        <button
          type="submit"
          disabled={loading || !propertyId || !unitId || !guestLabel.trim() || !checkIn || !checkOut}
          className="rounded-xl bg-emerald-800 px-5 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Création..." : "Ajouter la réservation"}
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
