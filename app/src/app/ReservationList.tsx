"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Reservation = {
  id: string;
  property_id: string;
  unit_id: string;
  reference: string | null;
  guest_label: string;
  check_in: string;
  check_out: string;
  status: string;
  note: string | null;
};

type Property = {
  id: string;
  name: string;
};

type Unit = {
  id: string;
  name: string;
};

export default function ReservationList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadReservations = async () => {
      const [
        { data: reservationsData, error: reservationsError },
        { data: propertiesData, error: propertiesError },
        { data: unitsData, error: unitsError },
      ] = await Promise.all([
        supabase
          .from("reservations")
          .select("*")
          .order("check_in", { ascending: true }),
        supabase.from("properties").select("id, name"),
        supabase.from("units").select("id, name"),
      ]);

      if (reservationsError || propertiesError || unitsError) {
        setMessage(
          "Erreur : " +
            (reservationsError?.message ||
              propertiesError?.message ||
              unitsError?.message)
        );
        setLoading(false);
        return;
      }

      setReservations(reservationsData ?? []);
      setProperties(propertiesData ?? []);
      setUnits(unitsData ?? []);
      setLoading(false);
    };

    loadReservations();
  }, []);

  const getPropertyName = (id: string) =>
    properties.find((property) => property.id === id)?.name ?? "Établissement inconnu";

  const getUnitName = (id: string) =>
    units.find((unit) => unit.id === id)?.name ?? "Logement inconnu";

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "En attente",
      confirmed: "Confirmée",
      cancelled: "Annulée",
      completed: "Terminée",
    };

    return labels[status] ?? status;
  };

  return (
    <section className="mt-6 rounded-2xl border border-[#e2e7ef] bg-white p-7 shadow-[0_8px_30px_rgba(23,45,77,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_35px_rgba(23,45,77,0.08)]">
      <h2 className="text-xl font-semibold tracking-tight text-[#171d29]">Mes réservations</h2>
      <p className="mt-2 text-sm text-gray-500">
        Retrouvez toutes les réservations enregistrées.
      </p>

      {loading && (
        <p className="mt-4 text-sm text-gray-500">
          Chargement des réservations...
        </p>
      )}

      {message && (
        <p className="mt-4 text-sm text-red-600">{message}</p>
      )}

      {!loading && !message && reservations.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">
          Aucune réservation pour le moment.
        </p>
      )}

      <div className="mt-5 space-y-4">
        {reservations.map((reservation) => (
          <article
            key={reservation.id}
            className="rounded-xl border border-[#e2e7ef] bg-white p-5 transition duration-200 hover:border-[#c5d2e2] hover:shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">
                {reservation.guest_label}
              </h3>
              <span className="rounded-full bg-[#edf2f8] px-3 py-1 text-xs font-medium text-[#29466b]">
                {getStatusLabel(reservation.status)}
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-600">
              <strong>Établissement :</strong> {getPropertyName(reservation.property_id)}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              <strong>Logement :</strong> {getUnitName(reservation.unit_id)}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              <strong>Arrivée :</strong> {reservation.check_in}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              <strong>Départ :</strong> {reservation.check_out}
            </p>

            {reservation.reference && (
              <p className="mt-1 text-sm text-gray-600">
                <strong>Référence :</strong> {reservation.reference}
              </p>
            )}

            {reservation.note && (
              <p className="mt-2 text-sm text-gray-500">
                <strong>Note :</strong> {reservation.note}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
