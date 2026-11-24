"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getLocalDate } from "../../lib/date-utils";
import { useProperty } from "../contexts/PropertyContext";
import AppLayout from "../../components/AppLayout";

type FinancialReservation = {
  property_id: string;
  total_amount: number | null;
  paid_amount: number | null;
  check_in: string;
  status: string;
};

export default function FinancesPage() {
  const {
  selectedPropertyId,
  setDashboardProperties,
} = useProperty();

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<
    { month: string; revenue: number }[]
  >([]);
  const [monthlyPaid, setMonthlyPaid] = useState<
    { month: string; paid: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  let isMounted = true;

  const loadFinancialData = async () => {
    setLoading(true);

    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("id, name, timezone");

    if (propertiesError) {
      console.error("Erreur chargement établissements :", propertiesError.message);
      if (isMounted) setLoading(false);
      return;
    }

    if (isMounted) {
  setDashboardProperties(properties ?? []);
}

    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select("property_id, unit_id, total_amount, paid_amount, status, check_in, check_out")
      .neq("status", "cancelled");

    if (reservationsError) {
      console.error("Erreur chargement réservations :", reservationsError.message);
      if (isMounted) setLoading(false);
      return;
    }

    if (!isMounted) return;

    const filteredReservations = (reservations ?? []).filter(
      (reservation) =>
        selectedPropertyId === "all" ||
        reservation.property_id === selectedPropertyId
    ) as FinancialReservation[];
    const now = new Date();

const relevantProperties = (properties ?? []).filter(
  (property) =>
    selectedPropertyId === "all" ||
    property.id === selectedPropertyId
);

const propertyMonthWindows = new Map<string, Set<string>>();
const monthKeys = new Set<string>();

relevantProperties.forEach((property) => {
  const today = getLocalDate(now, property.timezone || "Europe/Paris");
  const [year, month] = today.slice(0, 7).split("-").map(Number);
  const propertyMonths = new Set<string>();

  for (let index = 5; index >= 0; index--) {
    const date = new Date(Date.UTC(year, month - 1 - index, 1));

    const key = `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1
    ).padStart(2, "0")}`;

    propertyMonths.add(key);
    monthKeys.add(key);
  }

  propertyMonthWindows.set(property.id, propertyMonths);
});

const months = Array.from(monthKeys)
  .sort()
  .map((key) => ({
    key,
    label: new Intl.DateTimeFormat("fr-FR", {
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${key}-01T12:00:00Z`)),
  }));

const monthlyTotals = new Map(months.map(({ key }) => [key, 0]));
const monthlyPaidTotals = new Map(months.map(({ key }) => [key, 0]));

filteredReservations.forEach((reservation) => {
  if (!reservation.check_in) return;

  const key = reservation.check_in.slice(0, 7);
  const propertyMonths = propertyMonthWindows.get(reservation.property_id);

  if (!propertyMonths?.has(key)) return;

  monthlyTotals.set(
    key,
    (monthlyTotals.get(key) ?? 0) +
      Number(reservation.total_amount ?? 0)
  );

  monthlyPaidTotals.set(
    key,
    (monthlyPaidTotals.get(key) ?? 0) +
      Number(reservation.paid_amount ?? 0)
  );
});

setMonthlyRevenue(
  months.map(({ key, label }) => ({
    month: label,
    revenue: monthlyTotals.get(key) ?? 0,
  }))
);

setMonthlyPaid(
  months.map(({ key, label }) => ({
    month: label,
    paid: monthlyPaidTotals.get(key) ?? 0,
  }))
);

    const revenue = filteredReservations.reduce(
      (total, reservation) => total + Number(reservation.total_amount ?? 0),
      0
    );

    const paid = filteredReservations.reduce(
      (total, reservation) => total + Number(reservation.paid_amount ?? 0),
      0
    );

    const outstanding = filteredReservations.reduce(
      (total, reservation) =>
        total +
        Math.max(
          0,
          Number(reservation.total_amount ?? 0) -
            Number(reservation.paid_amount ?? 0)
        ),
      0
    );

    setTotalRevenue(revenue);
    setTotalPaid(paid);
    setTotalOutstanding(outstanding);
    setLoading(false);
  };

  loadFinancialData();

  return () => {
    isMounted = false;
  };
}, [selectedPropertyId]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1600px] px-4 pt-8 pb-28 sm:px-6 sm:pt-10 lg:px-12 lg:pb-10 xl:px-16">
        <section className="mb-8">
          <h2 className="text-3xl font-semibold tracking-tight text-[#101e33]">
            Finances
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#697586]">
            Suivez vos revenus, vos encaissements et les montants restant à percevoir.
          </p>
        </section>

        {loading ? (
  <p className="text-sm text-[#697586]">Chargement des données financières...</p>
) : (
  <>
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[
        {
          label: "Montant total réservé",
          value: totalRevenue,
          description: "Montant des réservations non annulées",
        },
        {
          label: "Montant encaissé",
          value: totalPaid,
          description: "Paiements déjà reçus",
        },
        {
          label: "Reste à encaisser",
          value: totalOutstanding,
          description: "Montant restant à percevoir",
        },
      ].map((item) => (
        <article
          key={item.label}
          className="rounded-2xl border border-[#e2e7ef] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-medium text-[#697586]">
            {item.label}
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-[#172d4d]">
            {item.value.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="mt-2 text-xs text-[#8993a3]">
            {item.description}
          </p>
        </article>
      ))}
    </section>

    <section className="mt-8 rounded-2xl border border-[#e2e7ef] bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#172d4d]">
        Performance financière
      </h3>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm text-[#697586]">Taux d'encaissement</p>
          <p className="mt-2 text-3xl font-semibold text-[#172d4d]">
            {totalRevenue > 0
              ? Math.round((totalPaid / totalRevenue) * 100)
              : 0}%
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf0f4]">
            <div
              className="h-full rounded-full bg-[#5279a8] transition-all duration-500"
              style={{
                width: `${totalRevenue > 0
                  ? Math.min(100, (totalPaid / totalRevenue) * 100)
                  : 0}%`,
              }}
            />
          </div>
        </div>

        <div>
          <p className="text-sm text-[#697586]">Montant restant à percevoir</p>
          <p className="mt-2 text-3xl font-semibold text-[#172d4d]">
            {totalOutstanding.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="mt-2 text-xs text-[#8993a3]">
            Sur l'ensemble des réservations non annulées
          </p>
        </div>
      </div>
        </section>

    <section className="mt-8 rounded-2xl border border-[#e2e7ef] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#172d4d]">
            Évolution financière
          </h3>
          <p className="mt-1 text-xs text-[#8993a3]">
            Montants réservés et encaissés sur les six derniers mois
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-[#697586]">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#5279a8]" />
            Réservé
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#aab8c9]" />
            Encaissé
          </span>
        </div>
      </div>

      <div className="mt-8 flex h-64 items-end justify-around gap-3 border-b border-[#e9edf2] pb-2 sm:gap-6">
        {monthlyRevenue.map((item, index) => {
          const paid = monthlyPaid[index]?.paid ?? 0;
          const maxValue = Math.max(
            ...monthlyRevenue.map((month) => month.revenue),
            ...monthlyPaid.map((month) => month.paid),
            1
          );

          return (
            <div
              key={`${item.month}-${index}`}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
            >
              <div className="flex h-full w-full items-end justify-center gap-1.5">
                <div
                  title={`Réservé : ${item.revenue.toLocaleString("fr-FR")} €`}
                  className="w-1/3 max-w-8 rounded-t-md bg-[#5279a8] transition-all duration-500"
                  style={{
                    height: `${Math.max(2, (item.revenue / maxValue) * 100)}%`,
                  }}
                />
                <div
                  title={`Encaissé : ${paid.toLocaleString("fr-FR")} €`}
                  className="w-1/3 max-w-8 rounded-t-md bg-[#aab8c9] transition-all duration-500"
                  style={{
                    height: `${Math.max(2, (paid / maxValue) * 100)}%`,
                  }}
                />
              </div>

              <span className="mt-3 text-[11px] font-medium capitalize text-[#697586]">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] text-[#8993a3]">
        Les montants sont regroupés selon le mois d'arrivée des réservations.
      </p>
    </section>
  </>
)}
      </div>
    </AppLayout>
  );
}