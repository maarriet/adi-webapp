"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { submitContactMessage } from "@/lib/actions/contact";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (submitted) {
    return (
      <div className="rounded-lg border border-neutral-100 bg-white p-6 text-center">
        <p className="font-heading text-xl text-neutral-900">
          ¡Gracias por escribirnos!
        </p>
        <p className="mt-2 text-sm text-neutral-600">
          Recibimos tu mensaje y te responderemos pronto.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const result = await submitContactMessage({ name, email, message });

        setIsSubmitting(false);

        if (result.ok) {
          setSubmitted(true);
        } else {
          setError(result.error);
        }
      }}
      className="flex flex-col gap-4"
    >
      <FormField
        type="text"
        label="Nombre completo"
        name="name"
        value={name}
        onChange={setName}
        required
      />
      <FormField
        type="email"
        label="Correo electrónico"
        name="email"
        value={email}
        onChange={setEmail}
        required
      />
      <FormField
        type="textarea"
        label="Mensaje"
        name="message"
        value={message}
        onChange={setMessage}
        required
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <div>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          Enviar mensaje
        </Button>
      </div>
    </form>
  );
}
