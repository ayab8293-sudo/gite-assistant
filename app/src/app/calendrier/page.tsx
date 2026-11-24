
"use client";

import AppLayout from "../../components/AppLayout";
import ReservationCalendar from "../ReservationCalendar";
import { useProperty } from "../contexts/PropertyContext";

export default function CalendarPage() {
  const { selectedPropertyId, dashboardProperties } = useProperty();

  const timezone =
    selectedPropertyId === "all"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : dashboardProperties.find(
          (property) => property.id === selectedPropertyId
        )?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1600px] px-4 pt-8 pb-28 sm:px-6 sm:pt-10 lg:px-12 lg:pb-10 xl:px-16">
        <section className="mb-8">
          <h2 className="text-3xl font-semibold tracking-tight text-[#101e33]">
            Calendrier
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#697586]">
            Consultez les réservations et les disponibilités de vos logements.
          </p>
        </section>

        <ReservationCalendar
          selectedPropertyId={selectedPropertyId}
          timezone={timezone}
        />
      </div>
    </AppLayout>
  );
}
