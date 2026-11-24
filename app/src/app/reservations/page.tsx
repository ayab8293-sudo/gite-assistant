
"use client";

import AppLayout from "../../components/AppLayout";
import ReservationForm from "../ReservationForm";
import ReservationList from "../ReservationList";

export default function ReservationsPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1600px] px-4 pt-8 pb-28 sm:px-6 sm:pt-10 lg:px-12 lg:pb-10 xl:px-16">
        <section className="mb-8">
          <h2 className="text-3xl font-semibold tracking-tight text-[#101e33]">
            Mes réservations
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#697586]">
            Consultez et gérez les réservations de vos établissements.
          </p>
        </section>

        <ReservationForm />
        <ReservationList />
      </div>
    </AppLayout>
  );
}
