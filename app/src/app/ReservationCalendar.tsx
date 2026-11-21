"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Reservation = {
  id: string;
  guest_label: string;
  check_in: string;
  check_out: string;
  status: string;
};

export default function ReservationCalendar() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
const [selectedDate, setSelectedDate] = useState(() => {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
});
  useEffect(() => {
    const loadReservations = async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("id, guest_label, check_in, check_out, status")
        .neq("status", "cancelled");

      if (error) {
        console.error("Erreur calendrier :", error.message);
      } else {
        setReservations(data ?? []);
      }

      setLoading(false);
    };

    loadReservations();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const startingDay = (firstDay.getDay() + 6) % 7;

  const getDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <section className="mt-5 rounded-2xl border border-[#e2e7ef] bg-white p-3 sm:p-5 lg:p-7 shadow-[0_8px_30px_rgba(23,45,77,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_35px_rgba(23,45,77,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#171d29]">Calendrier des réservations</h2>
          <p className="mt-1 text-sm text-gray-500">
            Retrouvez les arrivées et les départs.
          </p>
        </div>

        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start sm:gap-3">
          <button
            onClick={previousMonth}
            className="rounded-xl border border-[#d5dbe4] bg-white px-3 py-2 text-[#39465a] transition duration-200 hover:border-[#5279a8] hover:bg-slate-50"
          >
            ←
          </button>

          <h3 className="min-w-36 text-center font-semibold capitalize">
            {currentDate.toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </h3>

          <button
            onClick={nextMonth}
            className="rounded-xl border border-[#d5dbe4] bg-white px-3 py-2 text-[#39465a] transition duration-200 hover:border-[#5279a8] hover:bg-slate-50"
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-500">
          Chargement du calendrier...
        </p>
      ) : (
        <div className="mt-6">
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
              (day) => (
                <div
                  key={day}
                  className="py-2 text-xs font-semibold text-gray-500"
                >
                  {day}
                </div>
              )
            )}

            {Array.from({ length: startingDay }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dateKey = getDateKey(new Date(year, month, day));

              const arrivals = reservations.filter(
                (reservation) => reservation.check_in === dateKey
              );

              const departures = reservations.filter(
                (reservation) => reservation.check_out === dateKey
              );

              const isToday = dateKey === getDateKey(new Date());

              return (
                <div
  key={day}
  onClick={() => setSelectedDate(dateKey)}
  className={`min-h-16 sm:min-h-24 cursor-pointer min-w-0 rounded-lg border p-1 text-left ${
    selectedDate === dateKey
  ? "border-[#5279a8] bg-[#edf2f8] ring-1 ring-[#5279a8]/20"
  : isToday
    ? "border-[#27845d] bg-[#eff8f3]"
    : "border-[#e8edf3] bg-white hover:border-[#c5d2e2] hover:bg-slate-50"
  }`}
>
                  <span className="text-xs font-semibold">{day}</span>

                  {arrivals.map((reservation) => (
                    <div
                      key={`arrival-${reservation.id}`}
                      className="mt-1 min-w-0 truncate rounded bg-[#edf2f8] px-1 py-1 text-[9px] sm:text-[10px] text-[#29466b]"
                      title={reservation.guest_label}
                    >
                      ↗ {reservation.guest_label}
                    </div>
                  ))}

                  {departures.map((reservation) => (
                    <div
                      key={`departure-${reservation.id}`}
                      className="mt-1 min-w-0 truncate rounded bg-slate-100 px-1 py-1 text-[9px] sm:text-[10px] text-slate-600"
                      title={reservation.guest_label}
                    >
                      ↙ {reservation.guest_label}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
            <span>🟢 Arrivée</span>
            <span>🟠 Départ</span>
            <span>🟩 Aujourd'hui</span>
          </div>
         <div className="mt-6 border-t border-[#e8edf3] pt-5">
  <h3 className="font-semibold">
    Réservations du{" "}
    {new Date(selectedDate + "T12:00:00").toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}
  </h3>

  {reservations.filter(
    (reservation) =>
      reservation.check_in <= selectedDate &&
      reservation.check_out > selectedDate
  ).length === 0 ? (
    <p className="mt-2 text-sm text-gray-500">
      Aucune réservation pour cette journée.
    </p>
  ) : (
    reservations
      .filter(
        (reservation) =>
          reservation.check_in <= selectedDate &&
          reservation.check_out > selectedDate
      )
      .map((reservation) => (
        <div
          key={reservation.id}
          className="mt-3 rounded-xl border border-[#e2e7ef] bg-white p-4"
        >
          <p className="font-medium">{reservation.guest_label}</p>
          <p className="mt-1 text-xs text-gray-500">
            Arrivée : {reservation.check_in} · Départ : {reservation.check_out}
          </p>
        </div>
      ))
  )}
</div>
        </div>
      )}
    </section>
  );
}
