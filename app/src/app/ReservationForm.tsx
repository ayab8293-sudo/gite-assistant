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
  const [totalAmount, setTotalAmount] = useState("");
const [paidAmount, setPaidAmount] = useState("");
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
total_amount: totalAmount ? Number(totalAmount) : null,
paid_amount: paidAmount ? Number(paidAmount) : null,
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
      setTotalAmount("");
setPaidAmount("");
    }

    setLoading(false);
  };

  const availableUnits = units.filter(
    (unit) => unit.property_id === propertyId
  );

  return (
    <section className="mt-5 rounded-2xl border border-[#e2e7ef] bg-white p-5 sm:p-7 shadow-[0_8px_30px_rgba(23,45,77,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_35px_rgba(23,45,77,0.08)]">
      <h2 className="text-xl font-semibold tracking-tight text-[#171d29]">Ajouter une réservation</h2>
      <p className="mt-2 text-sm text-gray-500">
        Enregistrez une nouvelle réservation.
      </p>

<form onSubmit={createReservation} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Établissement
          </label>
          <select
            value={propertyId}
            onChange={(e) => {
              setPropertyId(e.target.value);
              setUnitId("");
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
            Logement
          </label>
          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            required
            disabled={!propertyId}
            className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
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
          className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        />

        <input
          value={guestLabel}
          onChange={(e) => setGuestLabel(e.target.value)}
          placeholder="Nom ou libellé du client"
          required
          className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        />
<div>
  <label className="mb-2 block text-sm font-medium">
    Montant total (€)
  </label>
  <input
    type="number"
    min="0"
    step="0.01"
    value={totalAmount}
    onChange={(e) => setTotalAmount(e.target.value)}
    placeholder="Ex. : 450"
    className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
  />
</div>

<div>
  <label className="mb-2 block text-sm font-medium">
    Montant encaissé (€)
  </label>
  <input
    type="number"
    min="0"
    step="0.01"
    value={paidAmount}
    onChange={(e) => setPaidAmount(e.target.value)}
    placeholder="Ex. : 200"
    className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
  />
</div>
        <div>
          <label className="mb-2 block text-sm font-medium">
            Date d'arrivée
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
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
            className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Statut
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
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
          className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          rows={3}
        />

        <button
          type="submit"
          disabled={loading || !propertyId || !unitId || !guestLabel.trim() || !checkIn || !checkOut}
className="w-full sm:w-auto rounded-xl bg-[#172d4d] px-6 py-3 font-medium text-white shadow-sm transition duration-200 hover:bg-[#29466b] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
