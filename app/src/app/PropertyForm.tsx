"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Organization = {
  id: string;
  name: string;
};

export default function PropertyForm() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("Europe/Paris");
  const timezones = Intl.supportedValuesOf("timeZone");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadOrganizations = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Vous devez être connecté.");
        return;
      }

      const { data: memberships, error: membershipError } =
        await supabase
          .from("memberships")
          .select("organization_id")
          .eq("user_id", user.id);

      if (membershipError) {
        setMessage("Erreur : " + membershipError.message);
        return;
      }

      const ids = memberships?.map((item) => item.organization_id) ?? [];

      if (ids.length === 0) {
        setMessage("Aucune organisation trouvée.");
        return;
      }

      const { data, error } = await supabase
        .from("organizations")
        .select("id, name")
        .in("id", ids);

      if (error) {
        setMessage("Erreur : " + error.message);
        return;
      }

      setOrganizations(data ?? []);

      if (data && data.length === 1) {
        setOrganizationId(data[0].id);
      }
    };

    loadOrganizations();
  }, []);

  const createProperty = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("properties").insert({
      organization_id: organizationId,
      name: name.trim(),
      address: address.trim(),
      timezone,
    });

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage("Établissement créé avec succès !");
      setName("");
      setAddress("");
    }

    setLoading(false);
  };

  return (
<section className="mt-6 rounded-2xl border border-[#e2e7ef] bg-white p-7 shadow-[0_8px_30px_rgba(23,45,77,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_35px_rgba(23,45,77,0.08)]">
<h2 className="text-xl font-semibold tracking-tight text-[#171d29]">Ajouter un établissement</h2>
      <p className="mt-2 text-sm text-gray-500">
        Enregistrez un nouvel établissement dans votre organisation.
      </p>

      <form onSubmit={createProperty} className="mt-5 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Organisation
          </label>
          <select
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            required
            className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
          >
            <option value="">Choisir une organisation</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de l'établissement"
          required
          className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
        />

        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Adresse de l'établissement"
          required
className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
/>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Fuseau horaire
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-xl border border-[#d5dbe4] bg-white px-4 py-3 text-[#171d29] placeholder:text-slate-400 outline-none transition duration-200 focus:border-[#5279a8] focus:ring-4 focus:ring-[#5279a8]/10"
          >
           {timezones.map((zone) => (
  <option key={zone} value={zone}>
    {zone}
  </option>
))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !organizationId || !name.trim() || !address.trim()}
className="rounded-xl bg-[#172d4d] px-6 py-3 font-medium text-white shadow-sm transition duration-200 hover:bg-[#29466b] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
>
          {loading ? "Création..." : "Ajouter mon établissement"}
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