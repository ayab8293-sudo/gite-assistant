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
      setMessage("Gîte créé avec succès !");
      setName("");
      setAddress("");
    }

    setLoading(false);
  };

  return (
    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Ajouter un gîte</h2>
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
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
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
          placeholder="Nom du gîte"
          required
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        />

        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Adresse du gîte"
          required
          className="w-full rounded-xl border border-gray-300 px-4 py-3"
        />

        <div>
          <label className="mb-2 block text-sm font-medium">
            Fuseau horaire
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          >
            <option value="Europe/Paris">Europe/Paris</option>
            <option value="Europe/Bucharest">Europe/Bucharest</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !organizationId || !name.trim() || !address.trim()}
          className="rounded-xl bg-emerald-800 px-5 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Création..." : "Ajouter mon gîte"}
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